"use client";

import { cn } from "@/lib/utils";
import ComparisonData from './types'; // Importing the interface

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ResponsivePie } from '@nivo/pie'

import defaultComparisonValues from "../../public/data/defaults.json";
import { ResultTable } from "./result-table/result-table";
import { ProcessResult, columns } from "./result-table/result-columns";
import { ReceiptEuro, RemoveFormatting, RemoveFormattingIcon } from 'lucide-react';
import { useState, useEffect } from "react";
import { ProcessData, Weight } from "./types";

export default function Home() {
  // TODO add priority import -> url -> default data
  const [comparisonData, setComparisonData] = useState<ProcessData>(defaultComparisonValues)
  const [processResults, setProcessResults] = useState<ProcessResult[]>();
  const [weightSliderValues, setWeightSliderValues] = useState<number[]>();
  const [maxWeight, setMaxWeight] = useState<number>(5);

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

    console.log(`Changed weight ${weightId} to ${weight}`);
  }

  // updating the calculations for the charts & update ui elements
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
        return weightedScore;
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

    // TODO update charts?
  }, [comparisonData]);

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
                    id={`weight-slider-${weight.id}`}
                    min={0} 
                    max={maxWeight}
                    step={0.2}
                    value={weightSliderValues?.[weight.id] ? [weightSliderValues[weight.id]] : [0]}
                    onValueChange={(value : number[]) => handleWeightChange(weight.id, `${value[0]}`)}
                    style={{ marginRight: "10%"}}
                  />
                  <Input
                    id={`weight-input-${weight.id}`}
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
          <div className="col-span-3" style={{ height: '90vh', width: '90vw' }}>
            { processResults ? <WeightingPieChart data={comparisonData.weights} /> : <></> }
          </div>
        </TabsContent>
        <TabsContent value="rating" className="p-8">
          Hello
        </TabsContent>
        <TabsContent value="importExport" className="p-8">
          
        </TabsContent>
        <TabsContent value="results" className="p-8">
          <div className="w-full h-[600px]">
            <ResultTable variant={"surface"} columns={columns} data={processResults} />
          </div>  
        </TabsContent>
      </Tabs>
    </main>
  );
}
