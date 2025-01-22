export const withoutHover = (value: Record<string, any>) => {
  return {
    ...value,
    _hover: {
      ...value,
    },
  }
}
