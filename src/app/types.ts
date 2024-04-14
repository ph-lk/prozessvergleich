export interface Rating {
  "name": string,
  "score": number,
}

export interface Weight {
  "id": number,
  "name": string,
  "weight": number,
  "description": string,
}

export interface Process {
    title: string,
    id: number,
    isActive: boolean,
    description: string,
    ratings: Rating[],
}
  
export interface ProcessData {
    processes: Process[],
    weights: Weight[],
}
