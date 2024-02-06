class RequestTimeRecorder {
  private readonly store: Record<string, number[]> = Object.create(null)

  private readonly getRecorder = (queryId: string): number[] => {
    if (!Array.isArray(this.store[queryId])) {
      this.store[queryId] = []
    }
    return this.store[queryId]
  }

  readonly saveRecord = (queryId: string, reqTime: number): this => {
    const recorder = this.getRecorder(queryId)
    recorder.push(reqTime)
    return this
  }

  readonly getRequestTimes = (queryId: string, after: number): number => {
    // reduce memory
    if (!Array.isArray(this.store[queryId])) return 0

    let result = 0

    this.getRecorder(queryId).forEach(reqTime => {
      if (reqTime >= after) {
        result++
      }
    })

    return result
  }

  readonly clearRecords = (before: number): void => {
    for (const queryId in this.store) {
      this.store[queryId] = this.getRecorder(queryId).filter(reqTime => reqTime > before)
    }
  }
};

export default RequestTimeRecorder
