import type {
  EpisodicMemory,
  IdentityMemory,
  ProceduralMemory,
  SemanticMemory,
  StructuredMemoryLayer,
  WorkingMemory
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import {
  GenerateEpisodicMemoryUseCase,
  GenerateIdentityMemoryUseCase,
  GenerateProceduralMemoryUseCase,
  GenerateSemanticMemoryUseCase,
  GenerateWorkingMemoryUseCase
} from "./structured-memory.js";

export class MemoryLayerProvider {
  private readonly workingMemory: GenerateWorkingMemoryUseCase;
  private readonly episodicMemory: GenerateEpisodicMemoryUseCase;
  private readonly semanticMemory: GenerateSemanticMemoryUseCase;
  private readonly identityMemory: GenerateIdentityMemoryUseCase;
  private readonly proceduralMemory: GenerateProceduralMemoryUseCase;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.workingMemory = new GenerateWorkingMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.episodicMemory = new GenerateEpisodicMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.semanticMemory = new GenerateSemanticMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.identityMemory = new GenerateIdentityMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.proceduralMemory = new GenerateProceduralMemoryUseCase(
      contexts,
      actionHistory
    );
  }

  async getWorkingMemory(): Promise<WorkingMemory> {
    return this.workingMemory.execute();
  }

  async getEpisodicMemory(): Promise<EpisodicMemory> {
    return this.episodicMemory.execute();
  }

  async getSemanticMemory(): Promise<SemanticMemory> {
    return this.semanticMemory.execute();
  }

  async getIdentityMemory(): Promise<IdentityMemory> {
    return this.identityMemory.execute();
  }

  async getProceduralMemory(): Promise<ProceduralMemory> {
    return this.proceduralMemory.execute();
  }

  async getAllLayers(): Promise<StructuredMemoryLayer[]> {
    return Promise.all([
      this.getWorkingMemory(),
      this.getEpisodicMemory(),
      this.getSemanticMemory(),
      this.getIdentityMemory(),
      this.getProceduralMemory()
    ]);
  }

  async getDurableLayers(): Promise<StructuredMemoryLayer[]> {
    return Promise.all([
      this.getEpisodicMemory(),
      this.getSemanticMemory(),
      this.getIdentityMemory(),
      this.getProceduralMemory()
    ]);
  }
}
