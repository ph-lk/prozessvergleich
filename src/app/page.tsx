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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import defaultComparisonValues from "../../public/data/defaults.json";
import { ResultTable } from "./result-table/result-table";
import { ProcessResult, columns } from "./result-table/result-columns";
import { ReceiptEuro } from 'lucide-react';
import { useState } from "react";

export default function Home() {
  var comparisonData: ComparisonData = defaultComparisonValues;
  
  const [value, setValue] = useState<number>(30);
  const [processResults, setProcessResults] = useState<ProcessResult[]>(() => {
    const ids = comparisonData.processes.map(process => process.id)
    const processes = comparisonData.processes.map(process => process.title)
    const unweighted = comparisonData.processes.map(process => {
      let totalUnweightedScore = 0;
      process.ratings.forEach(rating => {
        totalUnweightedScore = totalUnweightedScore + rating.score;
      })
      return totalUnweightedScore
    }, 0);
    const weighted = comparisonData.processes.map(process => {
      let totalWeightedScore = 0;
      process.ratings.forEach(rating => {
        const weight = comparisonData.weights.find(item => item.name === rating.name)?.weight || 0;
        totalWeightedScore = totalWeightedScore + weight * rating.score;
      })
      return totalWeightedScore;
    })
    let results : Array<ProcessResult> = []
    for (let i = 0; i < processes.length; i++) {
      results[i] = {
        id: ids[i],
        name: processes[i],
        scoreUnweighted: unweighted[i],
        scoreWeighted: weighted[i]
      };
    }
    return results
  }
  );
  return (
    <main>
      <Tabs defaultValue="processes" className="w-[1000px] mx-auto mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processes">Prozesse</TabsTrigger>
          <TabsTrigger value="weighting">Gewichtung</TabsTrigger>
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
                    <CardDescription>{process.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{process.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button>View process</Button>
                  {process.isActive && <p>active</p> || <p>inactive</p>}
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
                    <CardDescription>{weight.id}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{weight.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Slider defaultValue={[weight.weight]} max={5} step={0.2} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="importExport" className="p-8">
          <Slider onValueCommit={(newValue) => {setValue(newValue[0])}} defaultValue={[value]} max={100} step={1}/>
        </TabsContent>
        <TabsContent value="results" className="p-8">
          <div className="w-full h-[600px]">
            <ResultTable columns={columns} data={processResults} />
          </div>  
        </TabsContent>
      </Tabs>
    </main>
  );
}
