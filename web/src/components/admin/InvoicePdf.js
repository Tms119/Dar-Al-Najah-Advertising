import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { aed, fmtDate, num, totals } from '@/lib/invoice';

/* Short, simple A4 invoice in the website's style: condensed display
   headline (Bricolage Grotesque, registered as "Display" before render),
   ink pills, cream paper panel. Body text uses built-in Helvetica. */
const INK = '#121212';
const MUTED = '#6B665F';
const PAPER = '#F6F2EC';
const LINE = '#E6E1D9';

const s = StyleSheet.create({
  page: { padding: 44, fontSize: 10, fontFamily: 'Helvetica', color: INK, lineHeight: 1.45 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 },
  logo: { width: 140 },
  right: { alignItems: 'flex-end' },
  title: { fontFamily: 'Display', fontSize: 40, lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: -0.5 },
  pill: { marginTop: 8, backgroundColor: INK, color: '#fff', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 11, fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  dates: { marginTop: 7, color: MUTED, fontSize: 9 },
  stamp: { marginTop: 6, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#fff' },
  label: { fontSize: 7.5, color: MUTED, letterSpacing: 1.4, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  bill: { backgroundColor: PAPER, borderRadius: 12, padding: 14, marginBottom: 22 },
  billName: { fontFamily: 'Helvetica-Bold', fontSize: 11.5 },
  tHead: { flexDirection: 'row', borderBottomWidth: 1.2, borderBottomColor: INK, paddingBottom: 6 },
  tRow: { flexDirection: 'row', borderBottomWidth: 0.7, borderBottomColor: LINE, paddingVertical: 8 },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: 'right' },
  cPrice: { width: 84, textAlign: 'right' },
  cAmt: { width: 90, textAlign: 'right' },
  totals: { marginTop: 12, marginLeft: 'auto', width: 230 },
  tLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, paddingHorizontal: 14 },
  grand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, backgroundColor: INK, borderRadius: 24, paddingVertical: 9, paddingHorizontal: 16 },
  grandLabel: { fontFamily: 'Display', fontSize: 15, color: '#fff', textTransform: 'uppercase' },
  grandValue: { fontFamily: 'Display', fontSize: 17, color: '#fff' },
  notes: { marginTop: 18 },
  foot: { marginTop: 32, paddingTop: 12, borderTopWidth: 0.7, borderTopColor: LINE, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  footText: { color: MUTED, fontSize: 8.5, maxWidth: 380 },
  footName: { color: INK, fontFamily: 'Helvetica-Bold', fontSize: 9 },
});

export default function InvoicePdf({ invoice, settings, logoSrc }) {
  const t = totals(invoice.items, invoice.discount, invoice.vatRate);
  const c = invoice.customer;
  const contact = [settings.phone, settings.email].filter(Boolean).join('  ·  ');
  return (
    <Document title={invoice.number} author={settings.companyName} subject="Invoice">
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={s.logo} />
          <View style={s.right}>
            <Text style={s.title}>{invoice.vatRate > 0 && settings.trn ? 'Tax invoice' : 'Invoice'}</Text>
            <Text style={s.pill}>{invoice.number}</Text>
            <Text style={s.dates}>Date {fmtDate(invoice.issueDate)}{invoice.dueDate ? `   ·   Due ${fmtDate(invoice.dueDate)}` : ''}</Text>
            {invoice.status === 'paid' && <Text style={[s.stamp, { backgroundColor: '#00A86B' }]}>PAID</Text>}
            {invoice.status === 'void' && <Text style={[s.stamp, { backgroundColor: '#C4163F' }]}>VOID</Text>}
          </View>
        </View>

        <View style={s.bill}>
          <Text style={s.label}>Bill to</Text>
          <Text style={s.billName}>{c.company || c.name}</Text>
          {c.company && c.name ? <Text>{c.name}</Text> : null}
          {[c.phone, c.email].filter(Boolean).length ? <Text>{[c.phone, c.email].filter(Boolean).join('  ·  ')}</Text> : null}
          {c.address ? <Text>{c.address}</Text> : null}
          {c.trn ? <Text>TRN {c.trn}</Text> : null}
        </View>

        <View style={s.tHead}>
          <Text style={[s.cDesc, s.label, { marginBottom: 0 }]}>Item</Text>
          <Text style={[s.cQty, s.label, { marginBottom: 0 }]}>Qty</Text>
          <Text style={[s.cPrice, s.label, { marginBottom: 0 }]}>Price</Text>
          <Text style={[s.cAmt, s.label, { marginBottom: 0 }]}>Amount</Text>
        </View>
        {invoice.items.map((i, n) => (
          <View key={n} style={s.tRow} wrap={false}>
            <Text style={s.cDesc}>{i.description}</Text>
            <Text style={s.cQty}>{num(i.quantity)}</Text>
            <Text style={s.cPrice}>{aed(i.unitPrice)}</Text>
            <Text style={s.cAmt}>{aed((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0))}</Text>
          </View>
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.tLine}><Text>Subtotal</Text><Text>{aed(t.subtotal)}</Text></View>
          {invoice.discount > 0 ? <View style={s.tLine}><Text>Discount</Text><Text>{aed(-invoice.discount)}</Text></View> : null}
          {invoice.vatRate > 0 ? <View style={s.tLine}><Text>VAT {invoice.vatRate}%</Text><Text>{aed(t.vat)}</Text></View> : null}
          <View style={s.grand}><Text style={s.grandLabel}>Total</Text><Text style={s.grandValue}>{aed(t.total)}</Text></View>
        </View>

        {invoice.notes ? <Text style={s.notes}>{invoice.notes}</Text> : null}

        <View style={s.foot} wrap={false}>
          <View style={s.footText}>
            <Text style={s.footName}>{settings.companyName}{settings.trn ? `  ·  TRN ${settings.trn}` : ''}</Text>
            {[settings.address, contact].filter(Boolean).map((l) => <Text key={l}>{l}</Text>)}
            {settings.bankDetails ? <Text style={{ marginTop: 5 }}>{settings.bankDetails}</Text> : null}
            {settings.terms ? <Text style={{ marginTop: 5 }}>{settings.terms}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
