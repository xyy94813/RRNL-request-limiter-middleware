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

  /**
   * Get the first request time in the time window.
   * If no request time in the time window, return undefined.
   * [start, end)
   *
   * @param queryId
   * @param start
   * @param end
   * @returns
   */
  getFirstRequestTimeInRange = (queryId: string, start: number, end: number): number | undefined => {
    const recorder = this.getRecorder(queryId)
    return recorder.find(reqTime => reqTime >= start && reqTime < end)
  }

  readonly clearRecords = (before: number): void => {
    for (const queryId in this.store) {
      this.store[queryId] = this.getRecorder(queryId).filter(reqTime => reqTime > before)
    }
  }
};

export default RequestTimeRecorder
