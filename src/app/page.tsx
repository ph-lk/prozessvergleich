"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsivePie } from '@nivo/pie';
import { CopyIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import defaultComparisonValues from "../../public/data/defaults.json";
import jsonSchema from "../../public/data/schema.json";
import { ProcessResult, columns } from "./result-table/result-columns";
import { ResultTable } from "./result-table/result-table";
import { ProcessData, Weight } from "./types";

export default function Home() {
  const searchParams = useSearchParams()
  const dataParam = searchParams.get('data')
  const importData = dataParam ? JSON.parse(dataParam) : null;

  const [comparisonData, setComparisonData] = useState<ProcessData>(importData || defaultComparisonValues)
  const [processResults, setProcessResults] = useState<ProcessResult[]>();
  const [weightSliderValues, setWeightSliderValues] = useState<number[]>();
  const [maxWeight, setMaxWeight] = useState<number>(5);
  const [clientUrl, setClientUrl] = useState<string>("unknown");
  const [exportUrl, setExportUrl] = useState<string>("");

  const handleActiveSwitch = (processId: number, isActive: boolean) => {
    const updatedProcesses = comparisonData.processes.map(process => {
      if (process.id === processId) {
        return { ...process, isActive: isActive };
      }
      return process;
    });

    setComparisonData(prevData => ({
      ...prevData,
      processes: updatedProcesses
    }));
  };

  const handleWeightChange = (weightId: number, weightStr: string) => {
    const weight : number = parseFloat(weightStr);
    if (isNaN(weight)) return;

    const updatedWeights = comparisonData.weights.map(oldWeight => {
      if (oldWeight.id === weightId) {
        return { ...oldWeight, weight: weight };
      }
      return oldWeight;
    });

    setComparisonData(prevData => ({
      ...prevData,
      weights: updatedWeights
    }));
  }

  const handleRatingChange = (processId: number, ratingName: string, scoreStr: string) => {
    const score : number = parseFloat(scoreStr);
    if (isNaN(score)) return;

    const updatedProcesses = comparisonData.processes.map(oldProcess => {
      if (oldProcess.id === processId) {
        return { ...oldProcess, ratings: oldProcess.ratings.map(oldRating => {
            if (oldRating.name === ratingName) {
              return {...oldRating, score: score };
            }
            return oldRating;
        })}
      }
      return oldProcess;
    });

    setComparisonData(prevData => ({
      ...prevData,
      processes: updatedProcesses
    }));
  }

  useEffect(() => {
    setWeightSliderValues(() => {
      const weights : number[] = [];
      for (const weight of comparisonData.weights) {
        weights[weight.id] = weight.weight;
      }
      return weights;
    });

    const newLargestWeight = comparisonData.weights.reduce((maxWeight, weight) => {
      return weight.weight > maxWeight ? weight.weight : maxWeight;
    }, Number.NEGATIVE_INFINITY);
    if (maxWeight != newLargestWeight) setMaxWeight(newLargestWeight);

    setProcessResults(() => {
      const activeProcesses = comparisonData.processes.filter(process => process.isActive)
      const ids = activeProcesses.map(process => process.id);
      const processes = activeProcesses.map(process => process.title);
      const unweighted = activeProcesses.map(process => process.ratings.reduce((acc, curVal) => acc + curVal.score, 0));
      const weighted = activeProcesses.map(process => {
        let weightedScore = 0;
        for (const rating of process.ratings) {
          const weight = comparisonData.weights.find((weight) => weight.name === rating.name)
          if (!weight) throw new Error(`Error while analyzing data. Process "${process.title}" had rating for "${rating.name}" that was not found in weights. Check if the ratings and weights are correct.`)
          weightedScore += rating.score * weight.weight;
        }
        return +(weightedScore.toFixed(2));
      });
      const totalWeight = comparisonData.weights.reduce((acc, curVal) => acc + curVal.weight, 0);
      const weightNormalizedScore = weighted.map((score) => +((score / totalWeight).toFixed(2)));
      let results : Array<ProcessResult> = [];
      for (let i = 0; i < activeProcesses.length; i++) {
        results[i] = {
          id: ids[i],
          name: processes[i],
          scoreUnweighted: unweighted[i],
          scoreWeighted: weighted[i],
          weightNormalizedScore: weightNormalizedScore[i]
        };
      }
      return results
    });

    setExportUrl(`${clientUrl}?data=${JSON.stringify(comparisonData)}`);
  }, [comparisonData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientUrl(`${window.location.protocol}//${window.location.host}/` );
      setExportUrl(`${window.location.protocol}//${window.location.host}/?data=${JSON.stringify(comparisonData)}`);
    }
  }, []);

  const WeightingPieChart = (inputData : any) => (
    <ResponsivePie
        data={inputData.data.map((weight: Weight) => ({
            id: weight.id,
            label: weight.name,
            value: weight.weight,
            description: weight.description
        }))}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: 'purple_blue' }}
        sortByValue={true}
        borderWidth={1}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.2
                ]
            ]
        }}
        arcLinkLabel={'label'}
        arcLinkLabelsDiagonalLength={32}
        arcLinkLabelsStraightLength={36}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#FFFFFF"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
        tooltip={ slice =>
          {
            const description = comparisonData.weights.find((weight : Weight) => weight.id === slice.datum.id)?.description || "";
            return <Card style={{ width: '360px'}}>
              <CardHeader>
                <CardTitle>
                  {slice.datum.label}, ID {slice.datum.id}
                </CardTitle>
                <CardDescription>
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>Gewicht: {slice.datum.value}</div>
                <div>{(slice.datum.value/comparisonData.weights.reduce((acc, curVal) => acc + curVal.weight, 0) * 100).toFixed(2) + '% des Gesamtgewichts'}</div>
              </CardContent>
            </Card>
          }
        }
    />
  )


  return (
    <main>
      <Tabs defaultValue="processes" className="w-[1200px] mx-auto mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="processes">Prozesse</TabsTrigger>
          <TabsTrigger value="weighting">Gewichtung</TabsTrigger>
          <TabsTrigger value="rating">Bewertung</TabsTrigger>
          <TabsTrigger value="importExport">Import / Export</TabsTrigger>
          <TabsTrigger value="results">Auswertung</TabsTrigger>
        </TabsList>
        <TabsContent value="processes" className="p-8">
          <div className="grid grid-cols-3 gap-8">
            {comparisonData.processes.map((process, index) => (
              <Card key={process.id} className="flex flex-col justify-between">
                <CardHeader className="flex-row gap-4 items-center">
                  <div>
                    <CardTitle>{process.title}</CardTitle>
                    <CardDescription>ID: {process.id}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent style={{ height: "100%"}}>
                  <p>{process.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Switch
                    checked={process.isActive}
                    onCheckedChange={(isChecked) => handleActiveSwitch(process.id, isChecked)}
                  />
                  {process.isActive && <p>Aktiv, wird verglichen</p> || <p>Inaktiv, wird nicht verglichen</p>}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="weighting" className="p-8">
          <div className="grid grid-cols-3 gap-8 mx-auto">
            {comparisonData.weights.map((weight, index) => (
              <Card key={weight.id} className="flex flex-col justify-between" >
                <CardHeader className="flex-row gap-4 items-center">
                  <div>
                    <CardTitle>{weight.name}</CardTitle>
                    <CardDescription>ID: {weight.id}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent style={{ height: "100%"}}>
                  <p>{weight.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Slider 
                    min={0} 
                    max={maxWeight}
                    step={0.2}
                    value={weightSliderValues?.[weight.id] ? [weightSliderValues[weight.id]] : [0]}
                    onValueChange={(value : number[]) => handleWeightChange(weight.id, `${value[0]}`)}
                    style={{ marginRight: "10%"}}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.2}
                    value={weightSliderValues?.[weight.id] ? [`${weightSliderValues[weight.id]}`] : ["0"]}
                    onChange={(inputEvent) => handleWeightChange(weight.id, inputEvent.target.value)}
                    style={{ width: "30%"}}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
          < Separator className="my-24" />
          <div className="col-span-3" style={{ height: '80vh', width: '60vw' }}>
            { processResults ? <WeightingPieChart data={comparisonData.weights} /> : <></> }
          </div>
        </TabsContent>
        <TabsContent value="rating" className="p-8">
          <Table>
            <TableCaption>Zusammenfassung der Bewertungen</TableCaption>
            <TableHeader>
              <TableRow key="rating-header">
                <TableHead key="head-criteria" className="w-[100px]">Kriterium</TableHead>
                { comparisonData.processes
                    .filter((process) => process.isActive)
                    .map((process) => (
                      <TableHead key={`head-${process.id}`}>
                        {process.title}
                      </TableHead>
                    ))
                }
                {/*<TableHead className="text-right">Amount</TableHead>*/}
              </TableRow>
            </TableHeader>
            <TableBody>
              { comparisonData.weights
                  .map((weight) => (
                    <TableRow key={weight.id}>
                      <TableCell key={"rating-title"}>{weight.name}</TableCell>
                      { comparisonData.processes
                          .filter((process) => process.isActive)
                          .map((process) => {
                            const rating = process.ratings.find((rating) => rating.name === weight.name);
                            return <TableCell key={`${weight.id}-${rating!.name}`}>
                              <Input
                                type="number"
                                min={0}
                                step={0.2}
                                value={rating!.score}
                                onChange={(inputEvent) => handleRatingChange(process.id, rating!.name, inputEvent.target.value)}
                                style={{ width: "100%"}}
                              />
                            </TableCell>;
                        })
                      }
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="importExport" className="p-8">
          <div className="grid grid-cols-2 gap-8 mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Import</CardTitle>
                <CardDescription>Daten können über den data URL-Parameter importiert werden. In der Export-Sektion ist ein aktueller Link enthalten. Im Data Parameter wird eine JSON mit den aktuellen Prozessdaten gepackt. die JSON muss folgendem Schema entsprechen.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  value={JSON.stringify(jsonSchema)}
                  onFocus={(input => input.currentTarget.setSelectionRange(0, Number.MAX_SAFE_INTEGER))}
                  onClick={(input => input.currentTarget.setSelectionRange(0, Number.MAX_SAFE_INTEGER))}
                />
                <Button 
                  variant="secondary" 
                  className="my-4"
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(exportUrl)
                      .then(() => {
                        // If successful, show a success message to the user
                        toast("Erfolgreich in Zwischenablage kopiert.");
                      })
                      .catch((error) => {
                        // If an error occurs, handle it appropriately
                        console.error('Error copying to clipboard:', error);
                        // Optionally, show an error message to the user
                        toast("Fehler beim Kopieren in die Zwischenablage aufgetreten. Bitte manuell kopieren.");
                      });
                    } else {
                      toast("Browser bietet keinen Clipboard-context. Http wird in der Regel nicht unterstützt.");
                    }
                  }}
                >
                 <CopyIcon className="mr-2 h-4 w-4" /> Ins Clipboard kopieren
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription>Diese URL enthält den aktuellen Stand der Anwendung. Teilen Sie sie mit anderen oder kopieren Sie sie ins Adressfeld Ihres Browsers, um den aktuellen Stand abzurufen.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="url"
                  value={exportUrl}
                  onFocus={(input => input.currentTarget.setSelectionRange(0, Number.MAX_SAFE_INTEGER))}
                  onClick={(input => input.currentTarget.setSelectionRange(0, Number.MAX_SAFE_INTEGER))}
                />
                <Button 
                  variant="secondary" 
                  className="my-4"
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(exportUrl)
                      .then(() => {
                        // If successful, show a success message to the user
                        toast("Erfolgreich in Zwischenablage kopiert.");
                      })
                      .catch((error) => {
                        // If an error occurs, handle it appropriately
                        console.error('Error copying to clipboard:', error);
                        // Optionally, show an error message to the user
                        toast("Fehler beim Kopieren in die Zwischenablage aufgetreten. Bitte manuell kopieren.");
                      });
                    } else {
                      toast("Browser bietet keinen Clipboard-context. Http wird in der Regel nicht unterstützt.");
                    }
                  }}
                >
                 <CopyIcon className="mr-2 h-4 w-4" /> Ins Clipboard kopieren
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="results" className="p-8">
          <div className="w-full h-full">
            <ResultTable variant={"surface"} columns={columns} data={processResults} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
