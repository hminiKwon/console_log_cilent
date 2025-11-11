type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | string | number | null | undefined>;

/**
 * 최소한의 className 머지 유틸. 조건부 문자열/객체 입력을 지원한다.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === "string" || typeof input === "number") {
        return [String(input)];
      }
      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .join(" ");
}
