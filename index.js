import BluetoothPrinter from './utils/bluetooth_printer'
import BluetoothWeigher from './utils/bluetooth_weigher'
import { PrintPOS, PrintCPCL } from 'xcprinter'
import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

module.exports = {
  BluetoothPrinter: BluetoothPrinter,
  BluetoothWeigher: BluetoothWeigher,
  PrintCPCL: PrintCPCL,
  PrintPOS: PrintPOS,
  iconv: iconv,
  Qrcode: Qrcode
}
