import { log } from "logger";
import Head from "next/head";
import { Button } from "ui";

export default function Store() {
  log("Hey! This is Home.");
  return (
    <div className="container">
      <Head>
        <title>Store | Kitchen Sink</title>
      </Head>
      <h1 className="title">
        Store <br />
        <span>Kitchen Sink</span>
      </h1>
      <Button />
      <p className="description">
        Built With{" "}
      </p>
    </div>
  );
}
