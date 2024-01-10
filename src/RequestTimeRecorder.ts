class RequestTimeRecorder {
  private readonly store: Record<string, number[] | undefined> = Object.create(null)

  saveRecord = (queryId: string, reqTime: number): this => {
    if (!Array.isArray(this.store[queryId])) {
      this.store[queryId] = []
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.store[queryId]!.push(reqTime)

    return this
  }

  getRequestTimes = (queryId: string, after: number): number => {
    const reqTimeSet = this.store[queryId]

    if (!Array.isArray(reqTimeSet)) return 0

    let result = 0

    reqTimeSet.forEach(reqTime => {
      if (reqTime >= after) {
        result++
      }
    })

    return result
  }

  clearRecords = (before: number): void => {
    for (const queryId in this.store) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.store[queryId] = this.store[queryId]!.filter(reqTime => reqTime > before)
    }
  }
};

export default RequestTimeRecorder
