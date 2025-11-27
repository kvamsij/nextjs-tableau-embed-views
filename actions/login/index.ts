'use server';

import { redirect } from "next/navigation";
import generateJwt from "../utils/generate-token";
import getSession from "../utils/session";

// const { XMLParser } = require('fast-xml-parser');
import { XMLParser } from 'fast-xml-parser';

export async function login (prevState: { error: string } | null, formdata: FormData) {
  // const tableauUser = "vamsikalpamanu@nutritionintegrated.com";
  // const jwt = generateJwt({ user: tableauUser });
  const email = formdata.get("email") as string;
  
  let jwt;
  try {
    jwt = await generateJwt({ email });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate authentication token';
    return { error: errorMessage };
  }
  
  const baseUrl = process.env.TABLEAU_SERVER_URL ||'https://10ax.online.tableau.com';
  const siteName = process.env.SITE_ID || "sandbox-nutritionintegrated";
  const authUrl = `${baseUrl}/api/3.20/auth/signin`;
  


  const raw = `<tsRequest>
    <credentials jwt="${jwt}">
      <site contentUrl="${siteName}" />
    </credentials>
    </tsRequest>`;
  
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/xml");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw
  };

  const response = await fetch(authUrl, requestOptions);
  if (!response.ok) {
    console.log('something went wrong');
    const errorText = await response.text();
    console.error(errorText);
    return { error: 'Authentication failed. Please check your credentials.' };
  }
  const data = await response.text();
  console.log({data});
  if(!data){
    return { error: 'No authentication data received from server.' };
  }
  const parser = new XMLParser({ ignoreAttributes: false, ignoreDeclaration: true, attributeNamePrefix: '' });
  const { tsResponse } = parser.parse(data);
  const session = await getSession();
         session.siteId = tsResponse.credentials.site.id;
         session.token = tsResponse.credentials.token;
         session.jwt = jwt;
         session.isLoggedIn = true;
         await session.save();
         redirect('/views');

    // return data;
}