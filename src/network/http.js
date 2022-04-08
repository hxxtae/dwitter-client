// ------------------------
// 리팩토링
// ------------------------
// - 특정한 로직이 반복되어 보다 유연한 코드 작성과 깨끗한 코드 작성을 위해
// - 여기서 반복되는 옵션과 에러 처리를 하나의 함수안에 선언.

export default class HttpClient {
  constructor(baseURL, authErrorEventBus) {
    this.BASE_URL = baseURL;
    this.authErrorEventBus = authErrorEventBus;
  }

  async fetch(url, options) {
    const res = await fetch(`${this.BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    let data;
    try {
      data = await res.json();
    } catch (error) {
      console.error(error);
    }
    
    if (res.status > 299 || res.status < 200) {
      const message = data && data.message ? data.message : "Something went wrong !!";
      const error = new Error(message);
      if (res.status === 401) {
        this.authErrorEventBus.notify(error);
        return;
      }
      throw error;
    }
    return data;
  }
}
