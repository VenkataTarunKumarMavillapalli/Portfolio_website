"use client";

import { useState } from "react";
import { profile } from "@/lib/content";

export function ContactActions() {
  const [message,setMessage]=useState("");
  async function copyEmail(){try{await navigator.clipboard.writeText(profile.email);setMessage("Email address copied.");}catch{setMessage(`You can copy the address above: ${profile.email}`);}}
  return <><div className="actions"><a className="button primary" href={`mailto:${profile.email}`}>Write an email</a><button className="button secondary" onClick={copyEmail}>Copy email address</button></div><p className="copy-status" role="status" aria-live="polite">{message}</p></>;
}
