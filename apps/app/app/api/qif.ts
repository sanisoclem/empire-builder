import { parse } from 'date-fns';
export type QifFile = {
  type: string;
  items: Array<QifItem>;
};
type QifItem = {
  date?: Date;
  amount?: number;
  reference?: string;
  payee?: string;
  memo?: string;
  others: Array<{ type: string; value: string }>;
};

const DATE_FORMATS = {
  us: ['mm-dd-yyyyHH:MM:ss', 'mm-dd-yyyy', 'mm-dd-yy'],
  uk: ['dd-mm-yyyyHH:MM:ss', 'dd-mm-yyyy', 'dd-mm-yy', 'dd/mm/yy']
} as const;

type QifOptions = {
  format: keyof typeof DATE_FORMATS;
};
type QifItemField<T extends keyof QifItem> = {
  key: T;
  fn?: (v: string, opts: QifOptions) => QifItem[T];
};
const FIELD_MAP: Record<string, QifItemField<keyof QifItem>> = {
  D: {
    key: 'date',
    fn: (v: string, opts: QifOptions) => parseDate(v, opts.format)
  },
  T: {
    key: 'amount',
    fn: (v: string) => parseFloat(v.replace(',', ''))
  },
  N: {
    key: 'reference'
  },
  M: {
    key: 'memo'
  },
  P: {
    key: 'payee'
  }
} as const;

function parseDate(dateStr: string, format: keyof typeof DATE_FORMATS) {
  const formats = DATE_FORMATS[format];
  const pars = (f: string) =>parse(dateStr, f, new Date())
  const isValid = (d: Date | null) => d instanceof Date && !isNaN(d.getTime());

  const valids = formats.map(pars).filter(isValid);
  if (valids.length === 0) throw new Error(`Invalid date ${dateStr}`);

  return valids[0];
}

const parseField = (
  item: QifItem,
  { type, value }: { type: string; value: string },
  options: QifOptions
): QifItem => {
  if (type in FIELD_MAP) {
    return {
      ...item,
      [FIELD_MAP[type].key]: FIELD_MAP[type].fn?.(value, options) ?? value
    };
  }
  return {
    ...item,
    others: [...item.others, { type, value }]
  };
};

export function parseQif(qif: string, options: QifOptions): QifFile {
  const lines = qif.split('\n');
  let line = lines.shift() ?? '';
  const type = /!Type:([^$]*)$/.exec(line.trim());

  if (!type || !type.length) {
    throw new Error(`File does not appear to be a valid qif file: ${line}`);
  }

  return {
    type: type[1],
    items: qif
      .substring(qif.indexOf('\n'))
      .split('^')
      .map((t) =>
        t.split('\n').map((f) => ({
          type: f[0],
          value: f.substring(1)
        }))
      )
      .map((i) => i.reduce((acc, v) => parseField(acc, v, options), { others: [] } as QifItem))
  };
}
