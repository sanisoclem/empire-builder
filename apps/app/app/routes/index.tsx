import { LoaderFunction } from "@remix-run/server-runtime";
import { Button } from "ui";
import { PrismaClient } from "db-totality";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async (args) => {
  const client = new PrismaClient();
  try {
    const users = await client.user.findMany();
    return users;
  } catch (ex) {
    console.log(ex);
  } finally {
    client.$disconnect();
  }
};

export default function Index() {
  const loaderData = useLoaderData();
  return (
    <div className="container">
      {JSON.stringify(loaderData)}
      <h1 className="title">
        Blog <br />
        <span>Kitchen Sink</span>
      </h1>
      <Button />
      <p className="description">Built With </p>
    </div>
  );
}
