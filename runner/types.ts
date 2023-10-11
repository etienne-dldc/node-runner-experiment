export interface RunnerApi {
  todo: boolean;
}

export interface RunnerModule {
  runner: (api: RunnerApi) => Promise<any>;
}
