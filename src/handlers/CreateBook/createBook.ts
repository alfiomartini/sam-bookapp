import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { title, author, year } = JSON.parse(event.body || "{}");
  const id = uuidv4();

  if (!title || !author || !year) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Book title, author and year are needed",
      }),
    };
  }
  const params = {
    TableName: TABLE_NAME,
    Item: marshall({ id, title, author, year }),
  };

  try {
    await dynamoDBClient.send(new PutItemCommand(params));
    return { statusCode: 201, body: JSON.stringify({ id, title, author, year }) };
  } catch (error) {
    console.log('vreateBook Error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};