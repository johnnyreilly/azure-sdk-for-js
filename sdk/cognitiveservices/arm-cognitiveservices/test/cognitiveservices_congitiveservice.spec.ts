/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import {
  env,
  Recorder,
  RecorderStartOptions,
  isPlaybackMode,
} from "@azure-tools/test-recorder";
import { createTestCredential } from "@azure-tools/test-credential";
import { assert } from "chai";
import { Context } from "mocha";
import { CognitiveServicesManagementClient } from "../src/cognitiveServicesManagementClient";

const replaceableVariables: Record<string, string> = {
  AZURE_CLIENT_ID: "azure_client_id",
  AZURE_CLIENT_SECRET: "azure_client_secret",
  AZURE_TENANT_ID: "88888888-8888-8888-8888-888888888888",
  SUBSCRIPTION_ID: "azure_subscription_id"
};

const recorderOptions: RecorderStartOptions = {
  envSetupForPlayback: replaceableVariables
};

export const testPollingOptions = {
  updateIntervalInMs: isPlaybackMode() ? 0 : undefined,
};

describe("CognitiveServices test", () => {
  let recorder: Recorder;
  let subscriptionId: string;
  let client: CognitiveServicesManagementClient;
  let location: string;
  let resourceGroup: string;
  let accountName: string;

  beforeEach(async function (this: Context) {
    recorder = new Recorder(this.currentTest);
    await recorder.start(recorderOptions);
    subscriptionId = env.SUBSCRIPTION_ID || '';
    // This is an example of how the environment variables are used
    const credential = createTestCredential();
    client = new CognitiveServicesManagementClient(credential, subscriptionId, recorder.configureClientOptions({}));
    location = "eastus";
    resourceGroup = "myjstest";
    accountName = "myaccountxxxx";
  });

  afterEach(async function () {
    await recorder.stop();
  });

  it("accounts create test", async function () {
    const res = await client.accounts.beginCreateAndWait(resourceGroup, accountName, {
      location: location,
      kind: "CognitiveServices",
      sku: {
        name: "S0"
      },
      identity: {
        type: "SystemAssigned"
      }
    });
    assert.equal(res.name, accountName);
  });

  it("accounts get test", async function () {
    const res = await client.accounts.get(resourceGroup, accountName);
    assert.equal(res.name, accountName);
  });

  it("accounts list test", async function () {
    const resArray = new Array();
    for await (let item of client.accounts.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 1);
  });

  it("accounts regenerateKey test", async function () {
    const res = await client.accounts.regenerateKey(resourceGroup, accountName, "Key2");
    assert.notEqual(res.key2, "");
  });

  it("accounts update test", async function () {
    const res = await client.accounts.beginUpdateAndWait(resourceGroup, accountName, { tags: { tag1: "value1" } });
    assert.equal(res.type, "Microsoft.CognitiveServices/accounts")
  });

  it("accounts delete test", async function () {
    const res = await client.accounts.beginDeleteAndWait(resourceGroup, accountName);
    const resArray = new Array();
    for await (let item of client.accounts.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 0);
  });

  it("operations list test", async function () {
    const resArray = new Array();
    for await (let item of client.operations.list()) {
      resArray.push(item);
    }
  });
});
