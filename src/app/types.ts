interface Rating {
  "name": string,
  "score": number,
}

interface Weight {
  "id": number,
  "name": string,
  "weight": number,
  "description": string,
}

interface Process {
    title: string,
    id: number,
    isActive: boolean,
    description: string,
    ratings: Rating[],
}
  
interface ProcessData {
    processes: Process[],
    weights: Weight[],
}

export default ProcessData;