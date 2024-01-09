const sleep = async (times: number): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, times))
}

export default sleep
