// --------------------------------
// Client 에서 Server 데이터 요청
// --------------------------------

export default class TweetService {
  constructor(http) {
    this.http = http;
  }

  async getTweets(username) {
    const userName = username ? `?username=${username}` : '';
    return await this.http.fetch(`/tweets${userName}`, {
      method: 'GET',
    });
  }

  async postTweet(text) {
    return await this.http.fetch(`/tweets`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async deleteTweet(tweetId) {
    return await this.http.fetch(`/tweets/${tweetId}`, {
      method: 'DELETE',
    });
  }

  async updateTweet(tweetId, text) {
    return await this.http.fetch(`/tweets/${tweetId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
  }
}
