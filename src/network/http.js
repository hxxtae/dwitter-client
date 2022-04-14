import axios from 'axios';
import axiosRetry from 'axios-retry';

// ------------------------
// 리팩토링
// ------------------------
// - 특정한 로직이 반복되어 보다 유연한 코드 작성과 깨끗한 코드 작성을 위해
// - 여기서 반복되는 옵션과 에러 처리를 하나의 함수안에 선언.

const defaultRetryConfig = {
  retries: 5,
  initialDelayMs: 100,
}

export default class HttpClient {
  constructor(baseURL, authErrorEventBus, getCsrfToken, config = defaultRetryConfig) {
    this.authErrorEventBus = authErrorEventBus;
    this.getCsrfToken = getCsrfToken;
    this.client = axios.create({
      baseURL: baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // - axios에서 credentials
    });

    axiosRetry(this.client, {
      retries: config.retries,
      retryDelay: (retry) => {
        const delay = Math.pow(2, retry) * config.initialDelayMs; // ms : 100, 200, 400, 800, ...
        const jitter = delay * 0.1 * Math.random(); // 10, 20, 40, ...
        return delay + jitter;
      },
      retryCondition: (err) => 
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        err.response.status === 429,
    });
    // axiosRetry 함수를 이용해서
    // - 총 5번의 재시도가 이러날 수 있도록 만들어으며,
    // - 재시도를 할때 일정한 간격으로 재시도를 하는게 아니라, 복리처럼 n제곱으로 증가시켰다.
    // - 그리고 동일한 시간에 재시도를 하는 것이 아니라, 약간의 랜덤한 delay를 주었다.
    // -> 그렇지만 이렇게만 하여도 재시도가 일어나는 것이 아니라, 네트워크 에러나 요청에 실패 하였을 경우에만 재시도가 된다.
    //    그래서 어떠한 상황에 재시도가 일어나도록 지정할 수 있다.

    // 재시도가 일어나도록 지정한 컨디션은 다음과 같다.
    // - isNetworkOrIdempotentRequestError
    //   -> 네트워크 에러 이거나 & 서버의 상태를 변경하지 않는 "GET" 과 같은 Idempotent 이 유지가 되는 요청의 에러
    // - err.response.status === 429
    //   -> 서버에 너무 많은 요청이 왔을 때의 상태(429)
    // 이렇게 지정해 두면 클라이언트에서 자동으로 재시작을 해준다.
  }

  async fetch(url, options) {
    const { method, headers, body } = options;
    const req = {
      url,
      method,
      headers: {
        ...headers,
        'dwitter-csrf-token': this.getCsrfToken(),
      },
      data: body,
    };

    // 1. check res object
    // 2. check res.status object (not 2xx)
    try {
      const res = await this.client(req);
      return res.data;
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        const message = data && data.message ? data.message : 'Something went wrong!';
        throw new Error(message);
      }
      throw new Error('connection error');
    }
  }
}
