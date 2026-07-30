export type BranchRow = {
  date?: string;
  bma: string;
  code: string;
  branch: string;
  type: string;
  target: number;
  sg: number;
  sgApproved: number;
  sgUsed: number;
  ssf: number;
  ssfApproved: number;
  ssfUsed: number;
  sgMtd?: number;
  ssfMtd?: number;
  reporter: string;
  submitted: boolean;
  sgSubmitted?: boolean;
  ssfSubmitted?: boolean;
};

export const SHEET_ID = "16GqZoNTJItB6g_IfhfU8vGeJn-MPa8rabPHIVQa8yTU";
export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/16GqZoNTJItB6g_IfhfU8vGeJn-MPa8rabPHIVQa8yTU/edit?gid=1718888506#gid=1718888506";

export const SNAPSHOT_DATE = "28/07/2026";

export const snapshotRows: BranchRow[] = [
  { bma: "BMA 1", code: "80101182", branch: "True Move Shop Central Chaengwattana", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101271", branch: "True Shop Big C Chaengwattana", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101218", branch: "True Shop Big C Sainoi Nonthaburi", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101689", branch: "True Shop Big C Sukhaphiban 5 (D)", type: "COCO", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101217", branch: "True Shop Big C Sukhapibal 5", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80100477", branch: "True Shop Central Ladprao", type: "Matching", target: 3, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 3, ssfApproved: 0, ssfUsed: 0, reporter: "นุชรีย์", submitted: true },
  { bma: "BMA 1", code: "80101713", branch: "True Shop Central Northvill", type: "Matching", target: 3, sg: 1, sgApproved: 1, sgUsed: 1, ssf: 1, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 1", code: "80101702", branch: "True Shop Central Plaza Chaengwattana (D)", type: "HALL", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101264", branch: "True Shop Central Plaza Ramindra 1FL.", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 1, ssfApproved: 1, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 1", code: "80101185", branch: "True Shop Central Plaza West Gate", type: "Matching", target: 3, sg: 3, sgApproved: 0, sgUsed: 0, ssf: 2, ssfApproved: 0, ssfUsed: 0, reporter: "ณัฐวลัย", submitted: true },
  { bma: "BMA 1", code: "80101698", branch: "True Shop Central West Gate (D)", type: "HALL", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101627", branch: "True Shop Central Westville", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101623", branch: "True Shop Chaeng Watthana Government Complex", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101223", branch: "True Shop Gateway Bangsue", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80100807", branch: "True Shop Lotus's Nakhon In", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101584", branch: "True Shop Robinson Ratchapruek", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101305", branch: "True Shop Robinson Sri Saman", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80100480", branch: "True Shop The Mall Ngamwongwan 5Fl.", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 1", code: "80101180", branch: "True Shop Wongsawang Town Center", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 2", code: "80100626", branch: "True Shop Central Pinklao 3Fl.", type: "Matching", target: 3, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 2, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 2", code: "80100565", branch: "True Shop Central Rama 2", type: "Matching", target: 3, sg: 4, sgApproved: 3, sgUsed: 2, ssf: 1, ssfApproved: 1, ssfUsed: 1, reporter: "ธีระชัย", submitted: true },
  { bma: "BMA 2", code: "80100566", branch: "True Shop Central Rama 2 (H)", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 2", code: "80100736", branch: "True Shop Lotus's Bangpakok", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 2", code: "80100928", branch: "True Shop Seacon Bangkae", type: "Matching", target: 3, sg: 2, sgApproved: 0, sgUsed: 0, ssf: 2, ssfApproved: 1, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 2", code: "80101679", branch: "True Shop Seacon Bangkae (D)", type: "COCO", target: 1, sg: 1, sgApproved: 1, sgUsed: 0, ssf: 1, ssfApproved: 1, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 2", code: "80100484", branch: "True Shop The Mall Bangkae", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 2", code: "80100483", branch: "True Shop The Mall Thapra", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 3", code: "80100925", branch: "True Shop Fashion Island", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 3", code: "80101706", branch: "True Shop Fashion Island (D)", type: "HALL", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 3", code: "80101340", branch: "True Shop Future Park Rangsit", type: "Matching", target: 3, sg: 3, sgApproved: 1, sgUsed: 0, ssf: 1, ssfApproved: 1, ssfUsed: 1, reporter: "Ekasit Litbua", submitted: true },
  { bma: "BMA 3", code: "80101707", branch: "True Shop Future Park Rangsit (2 nd.) (D)", type: "HALL", target: 3, sg: 1, sgApproved: 1, sgUsed: 1, ssf: 2, ssfApproved: 1, ssfUsed: 1, reporter: "Nawaporn Chatcharaporn", submitted: true },
  { bma: "BMA 3", code: "80101708", branch: "True Shop Future Park Rangsit (G Fl.) (D)", type: "HALL", target: 3, sg: 6, sgApproved: 6, sgUsed: 6, ssf: 1, ssfApproved: 1, ssfUsed: 1, reporter: "Kageepan Klomgomul", submitted: true },
  { bma: "BMA 3", code: "80101341", branch: "True Shop Future Park Rangsit(H)", type: "Matching", target: 3, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 2, ssfApproved: 1, ssfUsed: 1, reporter: "Kageepan Klomgomul", submitted: true },
  { bma: "BMA 3", code: "80101350", branch: "True Shop iPlace Latkrabang", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 3", code: "80101123", branch: "True Shop Lotus's Sukhapibal 3", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 4", code: "80101418", branch: "True Shop Imperial World Samrong", type: "Non Matching", target: 1, sg: 5, sgApproved: 4, sgUsed: 3, ssf: 3, ssfApproved: 0, ssfUsed: 0, reporter: "sudarat yasaka", submitted: true },
  { bma: "BMA 4", code: "80101632", branch: "True Shop Lotus's Bangna-trad", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 4", code: "80100805", branch: "True Shop Lotus's Phatthanakan", type: "Non Matching", target: 1, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "โศภิษฐา", submitted: true },
  { bma: "BMA 4", code: "80101070", branch: "True Shop Mega Bangna", type: "Matching", target: 3, sg: 2, sgApproved: 2, sgUsed: 2, ssf: 1, ssfApproved: 1, ssfUsed: 1, reporter: "Jirarat Tanpo", submitted: true },
  { bma: "BMA 4", code: "80101709", branch: "True Shop Mega Bangna (D)", type: "HALL", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "Kist Sasiponmanee", submitted: true },
  { bma: "BMA 4", code: "80101296", branch: "True Shop Paradise Park Srinakarin", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 1, ssfApproved: 1, ssfUsed: 0, reporter: "กนกวรรณ", submitted: true },
  { bma: "BMA 4", code: "80101071", branch: "True Shop Seacon Square 2", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 4", code: "80100481", branch: "True Shop The Mall Bangkapi", type: "Matching", target: 3, sg: 2, sgApproved: 1, sgUsed: 1, ssf: 4, ssfApproved: 2, ssfUsed: 0, reporter: "ชัยวัฒน์ ทองเทพ", submitted: true },
  { bma: "BMA 5", code: "80101630", branch: "Kiosk Lotus's Ramindra", type: "Non Matching", target: 1, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101201", branch: "True Kiosk The Eight Thonglor", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101363", branch: "True Shop at Chamchuri Square 1", type: "Non Matching", target: 1, sg: 2, sgApproved: 2, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "อัศศพงศ์", submitted: true },
  { bma: "BMA 5", code: "80101186", branch: "True Shop Central Festival East Ville", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 2, ssfApproved: 1, ssfUsed: 0, reporter: "ทรงพล", submitted: true },
  { bma: "BMA 5", code: "80101068", branch: "True Shop Central Rama 3", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 5", code: "80100623", branch: "True Shop Central Rama 9", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80100622", branch: "True Shop Central Rama 9 4Fl.", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 5", code: "80100836", branch: "True Shop Central World Fl.4", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101221", branch: "True Shop Emquartier", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 1, ssfApproved: 1, ssfUsed: 0, reporter: "เพชรมณี เพ็ชรภา", submitted: true },
  { bma: "BMA 5", code: "80100715", branch: "True Shop Fortune Town 1Fl.", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 5", code: "80101269", branch: "True Shop Mahboon Krong 4Fl.", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 3, ssfApproved: 2, ssfUsed: 2, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101633", branch: "True Shop Makro Sri Ayutthaya", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101349", branch: "True Shop Silom Complex", type: "Non Matching", target: 1, sg: 1, sgApproved: 1, sgUsed: 0, ssf: 2, ssfApproved: 1, ssfUsed: 0, reporter: "สุนันทา", submitted: true },
  { bma: "BMA 5", code: "80100729", branch: "True Shop Station Lotus's Rama 4", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80101667", branch: "True Shop Supreme Complex (D)", type: "COCO", target: 1, sg: 1, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
  { bma: "BMA 5", code: "80100478", branch: "True Shop Terminal 21", type: "Matching", target: 3, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: false },
  { bma: "BMA 5", code: "80101347", branch: "True Shop U Chu Liang Building", type: "Non Matching", target: 1, sg: 0, sgApproved: 0, sgUsed: 0, ssf: 0, ssfApproved: 0, ssfUsed: 0, reporter: "", submitted: true },
];
