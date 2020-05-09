import React from 'react';
import App from 'next/app';
import '../css/tailwind.css';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <div>
        <h1>EarlyBirdCamp</h1>
        <br />
        <hr />
        <br />
        <Component {...pageProps} />
      </div>
    );
  }
}

export default MyApp;
