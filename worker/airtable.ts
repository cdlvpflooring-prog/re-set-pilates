// Minimal Airtable REST client plus the base's table and field ids.
// Ids (not names) are used everywhere, so renaming a column in Airtable never breaks the relay.

export const T = {
  members: "tbl7ahFVRozDsGXfX",
  plans: "tblqZPlYxy3zkCjCw",
  memberships: "tblKBENDwzs6llspm",
  payments: "tblIIyQMMR3bOlcv3",
  classes: "tblOaCnWy1WHjuYvu",
  bookings: "tblCk5FTY1Xs3PwZ5",
  waitlist: "tblOo8fGjtX7wFyGd",
  leads: "tblJjghK7UpbVBHzb",
  gifts: "tbloNKkxaVkjZXJfX",
  quiz: "tbl3drL2U1i2klUny",
  chat: "tblzgafUp7rIEzZBS",
  campaigns: "tblWOlnrR6b108QjW",
} as const;

export const F = {
  members: {
    fullName: "flddQHKaJbMIxnCY8",
    firstName: "fldqT7Lmt5kttziUH",
    lastName: "fldo9kd2BFUNH15nv",
    phone: "fldrfgNeaLPDJu0cW",
    email: "fldAJPhG7TL4e3S0o",
    language: "fldK7SquIvVTRMevJ",
    status: "fldH386vTlc6CmRIV",
    lifecycle: "fldNC6xAyKwUZizJ0",
    source: "fldipHK6HK3COH6cq",
    sourceDetail: "fldWJLy3PAV1jpzdo",
    signedUpOn: "fld6wznEmIrWDmaeN",
    interests: "fldrtBYlOW448LUE9",
    goals: "fldAeK6UcfLcHMvCx",
    experience: "fldIUU0TXIeAhdEfw",
    prefTimes: "fldpQpCHyPMjC0WeE",
    consent: "fld59nymdzcRxhBog",
    consentDate: "fldIBoLDqrWPmftwu",
    consentSource: "fldUIz3RUlMZs0TnN",
    memberships: "fldVVteIRW53tgSFK",
    termsOn: "fldObNiMJJSXpGxyV",
  },
  plans: {
    websiteId: "fldo0e3VGSWDNHDAU",
    name: "fld07vcAtRK5yfDiQ",
    type: "fldwPpaTrktgoJfBP",
    regular: "fldsRvM2IT9u0WOeL",
    launch: "fldfQsjSyQK8VlMXH",
    bonus: "fldlUX6ludXamCIAv",
    validityMonths: "fldusdrk7nEYUedWq",
  },
  memberships: {
    name: "fldZs6fc3caDOp96y",
    status: "fldXz1gGWrIJQYBJT",
    start: "fld3htcw5ISFjCfS3",
    renews: "fldhdJFSfkejJIhGW",
    bonus: "fld1uhRBEb8BNyw0x",
    pricePaid: "fldgmUL3EuqhY7s7M",
    launchApplied: "fldt9JXlAgDcvSt5H",
    soldBy: "fldyOmySXfpnQflby",
    member: "flddJAGCC4G0zPu08",
    plan: "fldX6VsFYMTAn9CYD",
  },
  payments: {
    name: "fldJEUXsnwVjpg4tW",
    for: "fldshiazXyjr2DbXv",
    amount: "fld0tPDrHvlZG9BTm",
    method: "fldaPMEL3Y84djhVA",
    status: "fldgTmY0aJyP7Vzqi",
    member: "fldEaKbDnwC6GfuiK",
    membership: "fld2DQRfREPecULFA",
    gift: "fldaH4XRGHKQiMkWU",
  },
  classes: {
    name: "fldaSFeYMtVsa8JQM",
    type: "fld5RSKBqV9zlWkOD",
    when: "fldNlOkJBUSbyZ2PM",
    minutes: "fldnvDb6aSd6TQrfe",
    capacity: "fldyEPBl20vAFdXI0",
    status: "fldsn9DhK0pTD7jyh",
    websiteId: "fldBHgUaEi4ZE6Nyy",
    startUnix: "flddSCy7vIWMF4CEF",
    onWaitlist: "fldYQgvZblIrZgvu8",
  },
  bookings: {
    name: "fldyjZzMrU6ExyjBR",
    bed: "fldOHmeUqCTjiTTLo",
    via: "fldRpEKFDEkrs7VCF",
    status: "fldD25icjJrroD1xC",
    cancelledOn: "fldO045Hlqb6m1U0y",
    member: "fldEn6Md2XnfJ8yyJ",
    class: "fldQpbk3hhquVqDlg",
    membership: "fldcWCddEi0NGbTfS",
    classStartUnix: "fldroUJbwrnzrJZbW",
  },
  waitlist: {
    name: "fldPmPArpzv98Q9ro",
    position: "fldrNkd3HPt0OXv6B",
    status: "fldiRiiBhAXC2efsg",
    member: "flddEzJ2Ot7bQXYqA",
    class: "fldAfDKHlnjO7Meq1",
  },
  leads: {
    name: "fldrM8xhyEiqAIS16",
    person: "fld4OOKK0Q5o92GKd",
    phone: "fldHr2SNK7OW7vYd7",
    email: "fldZS8vsZ84VcdJsd",
    channel: "fldX3WUV5D0LgBdlG",
    interested: "fldTGNZn8mmsLq3bf",
    message: "fldeQl8VJdYCIDpiX",
    prefTime: "fld6KfHIoIHAz3VMv",
    page: "fldtb9JQqzzQrJpmZ",
    status: "fldE87nF37iYCqxxA",
    member: "fldjbiy3ufnUE2Wse",
    campaign: "fldtfgr52V2UtZDDP",
    heard: "fldCmTBKElA5ujlqx",
    consent: "fldE1gzZe6goKkj8h",
  },
  gifts: {
    code: "fld2n5rdGafbtC2ZV",
    recipient: "fldvFjjB2b4kXxB76",
    message: "fldvAsvHPnsV9ZcnR",
    value: "fldN8tvVrBJoaGq2G",
    buyer: "fld3AGTUSD6OsYzxU",
    plan: "fldyAU9DCQ78DLLSg",
  },
  quiz: {
    result: "fldsUkFgRJzY9ucd3",
    goal: "fldedG9S5zJkdJuWk",
    experience: "fld9nE71KnZ0TvF8B",
    prefers: "fldbYPVrrmxJ69qzZ",
    recommended: "fldS4ioIdYtH536kG",
    member: "fldQTXaEkbiR3dz2C",
  },
  chat: {
    question: "fldvvRM4pVJmcaB3K",
    language: "fldxfBn0n1bSVMStU",
    answeredAuto: "fldhRfcS36BWAAnys",
    topic: "fldJ6aACX04TtQasp",
    handedToOrit: "fldJptg3db7CcuOon",
    answerUsed: "fldXY82EfQBQOFqBK",
  },
  campaigns: {
    utm: "fldvM8wPtnibMvNUv",
  },
} as const;

export type Fields = Record<string, unknown>;
export interface AirRecord {
  id: string;
  fields: Fields;
}

export class AirtableError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Airtable ${status}`);
  }
}

/** One instance per request: holds the token and base for that request only. */
export class Airtable {
  constructor(
    private readonly token: string,
    private readonly base: string,
  ) {}

  private async call(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`https://api.airtable.com/v0/${this.base}/${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new AirtableError(res.status, (await res.text()).slice(0, 500));
    return res.json();
  }

  async create(table: string, fields: Fields): Promise<AirRecord> {
    const r = (await this.call("POST", `${table}?returnFieldsByFieldId=true`, { records: [{ fields }] })) as { records: AirRecord[] };
    return r.records[0];
  }

  async update(table: string, id: string, fields: Fields): Promise<AirRecord> {
    return (await this.call("PATCH", `${table}/${id}?returnFieldsByFieldId=true`, { fields })) as AirRecord;
  }

  async get(table: string, id: string): Promise<AirRecord> {
    return (await this.call("GET", `${table}/${id}?returnFieldsByFieldId=true`)) as AirRecord;
  }

  /** First records matching an Airtable formula (field ids in braces work inside formulas). */
  async find(table: string, formula: string, max = 1): Promise<AirRecord[]> {
    const q = new URLSearchParams({ filterByFormula: formula, maxRecords: String(max), returnFieldsByFieldId: "true" });
    const r = (await this.call("GET", `${table}?${q}`)) as { records: AirRecord[] };
    return r.records;
  }
}

/** Quote a value for use inside an Airtable formula string. */
export const q = (v: string) => `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
