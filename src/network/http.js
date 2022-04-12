// ------------------------
// 리팩토링
// ------------------------
// - 특정한 로직이 반복되어 보다 유연한 코드 작성과 깨끗한 코드 작성을 위해
// - 여기서 반복되는 옵션과 에러 처리를 하나의 함수안에 선언.

export default class HttpClient {
  constructor(baseURL, authErrorEventBus, getCsrfToken) {
    this.BASE_URL = baseURL;
    this.authErrorEventBus = authErrorEventBus;
    this.getCsrfToken = getCsrfToken;
  }

  async fetch(url, options) {
    const res = await fetch(`${this.BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'dwitter-csrf-token': this.getCsrfToken(),
      },
      credentials: 'include',
      // - credentials
      //   클라이언트가 서버로 요청을 보낼때, '어떤 경우'에 쿠키 정보를 포함해서 보낼건지를 설정 할 수 있다.
      //   그래서 'same-origin' 이나 'include' 를 지정하면 자동으로 브라우저가 쿠키의 정보를 읽어서 여기 header 에 포함되어 전달된다.
      // - ommit : 어떤 경우에도 절대! 쿠키 정보를 포함하지 않는다.
      // - same-origin : 도메인이 동일한 경우(same-origin 인 경우) 에만 쿠키를 자동으로 포함
      // - include : 다른 도메인 이라도 (cross-origin 인 경우) 쿠키를 포함
    });

    // 1. check res object
    let data;
    try {
      data = await res.json();
    } catch (error) {
      console.error(error);
    }
    
    // 2. check res.status object (not 2xx)
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
