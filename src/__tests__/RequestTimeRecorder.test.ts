import RequestTimeRecorder from '../RequestTimeRecorder'

describe('RequestTimeRecorder', () => {
  let recorder: RequestTimeRecorder

  beforeEach(() => {
    recorder = new RequestTimeRecorder()
  })

  test('saveRecord should add request time to store', () => {
    recorder.saveRecord('query1', 100)
    recorder.saveRecord('query1', 200)

    expect(recorder.getRequestTimes('query1', 0)).toBe(2)
  })

  test('getRequestTimes should return the number of request times after a given time', () => {
    recorder.saveRecord('query1', 100)
    recorder.saveRecord('query1', 200)
    recorder.saveRecord('query2', 300)

    expect(recorder.getRequestTimes('query1', 150)).toBe(1)
    expect(recorder.getRequestTimes('query2', 0)).toBe(1)
    expect(recorder.getRequestTimes('query3', 0)).toBe(0)
  })
})
