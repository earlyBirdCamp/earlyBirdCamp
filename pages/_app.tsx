import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import '../css/tailwind.css';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <div className="shadow-inner pt-4 bg-white">
        <Head>
          <link
            rel="shortcut icon"
            href="https://img.alicdn.com/tfs/TB1cCrxFCf2gK0jSZFPXXXsopXa-289-285.jpg"
          />
          <title>EarlyBirdCamp（早鸟营）</title>
        </Head>
        <Component {...pageProps} />
      </div>
    );
  }
}

export default MyApp;
