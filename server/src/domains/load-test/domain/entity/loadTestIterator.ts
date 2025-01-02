export enum IterationMode {
  LINEAR = 'linear',
  RANDOM = 'random',
}

// Iterator 인터페이스 정의
export interface Iterator<T> {
  next(): T;
}

// ScenarioHandler 클래스
export class ScenarioHandler {
  private readonly bodyIterator: Iterator<Record<string, any>>;
  private readonly headersIterator: Iterator<Record<string, string>>;

  constructor(
    mode: IterationMode,
    headers: Record<string, string>[],
    body: Record<string, any>[],
  ) {
    this.bodyIterator = IteratorFactory.getInstance(
      body,
      mode,
    );
    this.headersIterator = IteratorFactory.getInstance(
      headers,
      mode,
    );
  }

  // Body 요소 가져오기
  getNextBody(): Record<string, any> {
    return this.bodyIterator.next();
  }

  // Headers 요소 가져오기
  getNextHeaders(): Record<string, string> | undefined {
    return this.headersIterator.next();
  }
}

export class IteratorFactory {
  static getInstance<T>(elements: T[], mode: IterationMode): Iterator<T> {
    switch (mode) {
      case IterationMode.LINEAR:
        return new LinearIterator(elements);
      case IterationMode.RANDOM:
        return new RandomIterator(elements);
      default:
        throw new Error(`Unsupported iteration mode: ${mode}`);
    }
  }
}

// LinearIterator: 요소를 순차적으로 반환
export class LinearIterator<T> implements Iterator<T> {
  private index = 0;

  constructor(private readonly elements: T[]) {}

  next(): T {
    if (this.index >= this.elements.length) {
      this.index = 0;
    }
    const element = this.elements[this.index];
    this.index++;
    return element;
  }
}

// RandomIterator: 요소를 랜덤 순회하며 반환
export class RandomIterator<T> implements Iterator<T> {
  private remainingElements: T[];

  constructor(private readonly elements: T[]) {
    this.remainingElements = [...elements];
  }

  next(): T {
    if (this.remainingElements.length === 0) {
      this.remainingElements = [...this.elements];
    }

    const randomIndex = Math.floor(
      Math.random() * this.remainingElements.length,
    );
    const element = this.remainingElements[randomIndex];
    this.remainingElements.splice(randomIndex, 1);
    return element;
  }
}