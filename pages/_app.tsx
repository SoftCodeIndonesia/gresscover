import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return <>
      <Head>
        <title>SellGenix</title>
        <meta name="description" content="SellGenix adalah solusi cerdas untuk manajemen inventory dan penjualan berbasis teknologi. Optimalkan stok, percepat transaksi, dan tingkatkan efisiensi bisnis Anda dengan sistem yang modern dan mudah digunakan."/>
      </Head>
    <Component {...pageProps} />
  </>;
}
