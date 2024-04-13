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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import defaultComparisonValues from "../../public/data/defaults.json";
import { ResultTable } from "./result-table/result-table";
import { ProcessResult, columns } from "./result-table/result-columns";
import { ReceiptEuro, RemoveFormatting, RemoveFormattingIcon } from 'lucide-react';
import { useState, useEffect } from "react";
import ProcessData from "./types";

export default function Home() {
  // TODO add priority import -> url -> default data
  const [comparisonData, setComparisonData] = useState<ProcessData>(defaultComparisonValues)
  const [processResults, setProcessResults] = useState<ProcessResult[]>();

  useEffect(() => {
    setProcessResults(() => {
      const activeProcesses = comparisonData.processes.filter(process => process.isActive)
      const ids = activeProcesses.map(process => process.id);
      const processes = activeProcesses.map(process => process.title);
      const unweighted = activeProcesses.map(process => process.ratings.reduce((acc, curVal) => acc + curVal.score, 0));
      const weighted = activeProcesses.map(process => {
        let weightedScore = 0;
        for (const rating of process.ratings) {
          const weight = comparisonData.weights.find((weight) => weight.name === rating.name)
          if (!weight) throw new Error(`Error while analyzing data. Process "${process.title}" had rating for "${rating.name}" that was not found in weights.`)
          weightedScore += rating.score * weight.weight;
        }
        return weightedScore;
      });
      const totalWeight = comparisonData.weights.reduce((acc, curVal) => acc + curVal.weight, 0);
      const weightNormalizedScore = weighted.map((score) => score / totalWeight);
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
  }, [comparisonData]);


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
                    onCheckedChange={}
                  />
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
        <TabsContent value="rating" className="p-8">
          Hello
        </TabsContent>
        <TabsContent value="importExport" className="p-8">
          
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
