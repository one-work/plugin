import BluetoothPrinter from './utils/bluetooth_printer'
import BluetoothWeigher from './utils/bluetooth_weigher'
import { PrintPOS, PrintCPCL, PrintPic } from 'xcprinter'
import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

module.exports = {
  BluetoothPrinter: BluetoothPrinter,
  BluetoothWeigher: BluetoothWeigher,
  PrintCPCL: PrintCPCL,
  PrintPOS: PrintPOS,
  PrintPic: PrintPic,
  iconv: iconv,
  Qrcode: Qrcode
}
