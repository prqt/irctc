/**
 * Comprehensive Indian Railway Stations Database
 * Major Stations, Junctions, Terminals & Divisions across India
 */

export const INDIAN_STATIONS = [
  // Delhi NCR
  { code: 'NDLS', name: 'New Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Junction', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', state: 'Delhi' },
  { code: 'DEC', name: 'Delhi Cantt', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', state: 'Delhi' },
  { code: 'GZB', name: 'Ghaziabad Junction', state: 'Uttar Pradesh' },
  { code: 'FDB', name: 'Faridabad', state: 'Haryana' },
  { code: 'GGN', name: 'Gurgaon', state: 'Haryana' },

  // Maharashtra
  { code: 'CSMT', name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus', state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus (Mumbai)', state: 'Maharashtra' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus (Kurla)', state: 'Maharashtra' },
  { code: 'DR', name: 'Dadar Central (Mumbai)', state: 'Maharashtra' },
  { code: 'PNVL', name: 'Panvel Junction', state: 'Maharashtra' },
  { code: 'TNA', name: 'Thane', state: 'Maharashtra' },
  { code: 'KYN', name: 'Kalyan Junction', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', state: 'Maharashtra' },
  { code: 'SUR', name: 'Solapur Junction', state: 'Maharashtra' },
  { code: 'KOP', name: 'Kolhapur CSMT', state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', state: 'Maharashtra' },
  { code: 'BSL', name: 'Bhusawal Junction', state: 'Maharashtra' },
  { code: 'AWB', name: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra' },
  { code: 'NED', name: 'Hazur Sahib Nanded', state: 'Maharashtra' },
  { code: 'AK', name: 'Akola Junction', state: 'Maharashtra' },
  { code: 'BD', name: 'Badnera Junction (Amravati)', state: 'Maharashtra' },
  { code: 'IGP', name: 'Igatpuri', state: 'Maharashtra' },
  { code: 'MMR', name: 'Manmad Junction', state: 'Maharashtra' },
  { code: 'JL', name: 'Jalgaon Junction', state: 'Maharashtra' },
  { code: 'WR', name: 'Wardha Junction', state: 'Maharashtra' },
  { code: 'CD', name: 'Chandrapur', state: 'Maharashtra' },
  { code: 'BPQ', name: 'Balharshah Junction', state: 'Maharashtra' },
  { code: 'MRJ', name: 'Miraj Junction', state: 'Maharashtra' },
  { code: 'STR', name: 'Satara', state: 'Maharashtra' },

  // West Bengal
  { code: 'HWH', name: 'Howrah Junction (Kolkata)', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah (Kolkata)', state: 'West Bengal' },
  { code: 'KOAA', name: 'Kolkata Chitpur Terminal', state: 'West Bengal' },
  { code: 'SHM', name: 'Shalimar (Kolkata)', state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', state: 'West Bengal' },
  { code: 'ASN', name: 'Asansol Junction', state: 'West Bengal' },
  { code: 'DGR', name: 'Durgapur', state: 'West Bengal' },
  { code: 'BWN', name: 'Barddhaman Junction', state: 'West Bengal' },
  { code: 'NJP', name: 'New Jalpaiguri (Siliguri)', state: 'West Bengal' },
  { code: 'MLDT', name: 'Malda Town', state: 'West Bengal' },
  { code: 'RPH', name: 'Rampurhat Junction', state: 'West Bengal' },
  { code: 'BOE', name: 'Barsoi Junction', state: 'West Bengal' },
  { code: 'AZ', name: 'Azimganj Junction', state: 'West Bengal' },
  { code: 'BLGT', name: 'Balurghat', state: 'West Bengal' },
  { code: 'APDJ', name: 'Alipurduar Junction', state: 'West Bengal' },

  // Tamil Nadu
  { code: 'MAS', name: 'Chennai Central (Dr. MGR)', state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', state: 'Tamil Nadu' },
  { code: 'TBM', name: 'Tambaram (Chennai)', state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Junction', state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Junction', state: 'Tamil Nadu' },
  { code: 'TPJ', name: 'Tiruchchirappalli Junction (Trichy)', state: 'Tamil Nadu' },
  { code: 'SA', name: 'Salem Junction', state: 'Tamil Nadu' },
  { code: 'ED', name: 'Erode Junction', state: 'Tamil Nadu' },
  { code: 'TUP', name: 'Tiruppur', state: 'Tamil Nadu' },
  { code: 'TEN', name: 'Tirunelveli Junction', state: 'Tamil Nadu' },
  { code: 'RMM', name: 'Rameswaram', state: 'Tamil Nadu' },
  { code: 'CAPE', name: 'Kanyakumari', state: 'Tamil Nadu' },
  { code: 'NCJ', name: 'Nagercoil Junction', state: 'Tamil Nadu' },
  { code: 'DG', name: 'Dindigul Junction', state: 'Tamil Nadu' },
  { code: 'KRR', name: 'Karur Junction', state: 'Tamil Nadu' },
  { code: 'VM', name: 'Villupuram Junction', state: 'Tamil Nadu' },
  { code: 'KPD', name: 'Katpadi Junction (Vellore)', state: 'Tamil Nadu' },
  { code: 'TN', name: 'Tuticorin', state: 'Tamil Nadu' },
  { code: 'TJ', name: 'Thanjavur Junction', state: 'Tamil Nadu' },
  { code: 'KMU', name: 'Kumbakonam', state: 'Tamil Nadu' },

  // Karnataka
  { code: 'SBC', name: 'KSR Bengaluru City (Bangalore)', state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction (Bengaluru)', state: 'Karnataka' },
  { code: 'SMVB', name: 'Sir M. Visvesvaraya Terminal (Bengaluru)', state: 'Karnataka' },
  { code: 'BNC', name: 'Bengaluru Cantt', state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Junction (Mysore)', state: 'Karnataka' },
  { code: 'UBL', name: 'SSS Hubballi Junction (Hubli)', state: 'Karnataka' },
  { code: 'DWR', name: 'Dharwad', state: 'Karnataka' },
  { code: 'MAQ', name: 'Mangaluru Central (Mangalore)', state: 'Karnataka' },
  { code: 'MAJN', name: 'Mangaluru Junction', state: 'Karnataka' },
  { code: 'BGM', name: 'Belagavi (Belgaum)', state: 'Karnataka' },
  { code: 'KLBG', name: 'Kalaburagi (Gulbarga)', state: 'Karnataka' },
  { code: 'BAY', name: 'Ballari Junction (Bellary)', state: 'Karnataka' },
  { code: 'HPT', name: 'Hosapete Junction (Hampi)', state: 'Karnataka' },
  { code: 'DVG', name: 'Davangere', state: 'Karnataka' },
  { code: 'ASK', name: 'Arsikere Junction', state: 'Karnataka' },
  { code: 'HAS', name: 'Hassan Junction', state: 'Karnataka' },
  { code: 'RRB', name: 'Birur Junction', state: 'Karnataka' },
  { code: 'BJP', name: 'Vijayapura (Bijapur)', state: 'Karnataka' },
  { code: 'BGK', name: 'Bagalkot', state: 'Karnataka' },
  { code: 'UD', name: 'Udupi', state: 'Karnataka' },

  // Gujarat
  { code: 'ADI', name: 'Ahmedabad Junction', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction (Baroda)', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', state: 'Gujarat' },
  { code: 'RJT', name: 'Rajkot Junction', state: 'Gujarat' },
  { code: 'BVC', name: 'Bhavnagar Terminus', state: 'Gujarat' },
  { code: 'JAM', name: 'Jamnagar', state: 'Gujarat' },
  { code: 'GIMB', name: 'Gandhidham Junction', state: 'Gujarat' },
  { code: 'BHUJ', name: 'Bhuj', state: 'Gujarat' },
  { code: 'DWK', name: 'Dwarka', state: 'Gujarat' },
  { code: 'PBR', name: 'Porbandar', state: 'Gujarat' },
  { code: 'VRL', name: 'Veraval (Somnath)', state: 'Gujarat' },
  { code: 'GNC', name: 'Gandhinagar Capital', state: 'Gujarat' },
  { code: 'ANND', name: 'Anand Junction', state: 'Gujarat' },
  { code: 'ND', name: 'Nadiad Junction', state: 'Gujarat' },
  { code: 'BH', name: 'Bharuch Junction', state: 'Gujarat' },
  { code: 'BL', name: 'Valsad', state: 'Gujarat' },
  { code: 'VAPI', name: 'Vapi', state: 'Gujarat' },
  { code: 'MSH', name: 'Mehsana Junction', state: 'Gujarat' },
  { code: 'PNU', name: 'Palanpur Junction', state: 'Gujarat' },

  // Uttar Pradesh
  { code: 'LKO', name: 'Lucknow Charbagh NR', state: 'Uttar Pradesh' },
  { code: 'LJN', name: 'Lucknow Junction NER', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', state: 'Uttar Pradesh' },
  { code: 'BSBS', name: 'Banaras (Manduadih)', state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction (Mughalsarai)', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction (Allahabad)', state: 'Uttar Pradesh' },
  { code: 'PRRB', name: 'Prayagraj Rambag', state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', state: 'Uttar Pradesh' },
  { code: 'AF', name: 'Agra Fort', state: 'Uttar Pradesh' },
  { code: 'MTJ', name: 'Mathura Junction', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', state: 'Uttar Pradesh' },
  { code: 'AY', name: 'Ayodhya Dham Junction', state: 'Uttar Pradesh' },
  { code: 'AYC', name: 'Ayodhya Cantt', state: 'Uttar Pradesh' },
  { code: 'MB', name: 'Moradabad Junction', state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Junction', state: 'Uttar Pradesh' },
  { code: 'ALJN', name: 'Aligarh Junction', state: 'Uttar Pradesh' },
  { code: 'MTC', name: 'Meerut City Junction', state: 'Uttar Pradesh' },
  { code: 'SRE', name: 'Saharanpur Junction', state: 'Uttar Pradesh' },
  { code: 'JHS', name: 'Virangana Lakshmibai Jhansi Junction', state: 'Uttar Pradesh' },
  { code: 'GD', name: 'Gonda Junction', state: 'Uttar Pradesh' },
  { code: 'BST', name: 'Basti', state: 'Uttar Pradesh' },
  { code: 'MAU', name: 'Mau Junction', state: 'Uttar Pradesh' },
  { code: 'BUI', name: 'Ballia', state: 'Uttar Pradesh' },
  { code: 'SLN', name: 'Sultanpur Junction', state: 'Uttar Pradesh' },
  { code: 'RBL', name: 'Rae Bareli Junction', state: 'Uttar Pradesh' },
  { code: 'JOP', name: 'Jaunpur Junction', state: 'Uttar Pradesh' },

  // Bihar
  { code: 'PNBE', name: 'Patna Junction', state: 'Bihar' },
  { code: 'PPTA', name: 'Patliputra Junction (Patna)', state: 'Bihar' },
  { code: 'DNR', name: 'Danapur', state: 'Bihar' },
  { code: 'RJPB', name: 'Rajendra Nagar Terminal (Patna)', state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Junction', state: 'Bihar' },
  { code: 'MFP', name: 'Muzaffarpur Junction', state: 'Bihar' },
  { code: 'DBG', name: 'Darbhanga Junction', state: 'Bihar' },
  { code: 'BJU', name: 'Barauni Junction', state: 'Bihar' },
  { code: 'BGS', name: 'Begusarai', state: 'Bihar' },
  { code: 'KIR', name: 'Katihar Junction', state: 'Bihar' },
  { code: 'SPJ', name: 'Samastipur Junction', state: 'Bihar' },
  { code: 'CPR', name: 'Chhapra Junction', state: 'Bihar' },
  { code: 'SV', name: 'Siwan Junction', state: 'Bihar' },
  { code: 'BKP', name: 'Bakhtiyarpur Junction', state: 'Bihar' },
  { code: 'ARA', name: 'Ara Junction', state: 'Bihar' },
  { code: 'BXR', name: 'Buxar', state: 'Bihar' },
  { code: 'MKA', name: 'Mokama Junction', state: 'Bihar' },
  { code: 'KIUL', name: 'Kiul Junction', state: 'Bihar' },
  { code: 'BGP', name: 'Bhagalpur Junction', state: 'Bihar' },
  { code: 'JYG', name: 'Jaynagar', state: 'Bihar' },
  { code: 'RXL', name: 'Raxaul Junction', state: 'Bihar' },

  // Rajasthan
  { code: 'JP', name: 'Jaipur Junction', state: 'Rajasthan' },
  { code: 'GADJ', name: 'Gandhinagar Jaipur', state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Junction', state: 'Rajasthan' },
  { code: 'BKN', name: 'Bikaner Junction', state: 'Rajasthan' },
  { code: 'UDZ', name: 'Udaipur City', state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Junction', state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Junction', state: 'Rajasthan' },
  { code: 'SWM', name: 'Sawai Madhopur Junction', state: 'Rajasthan' },
  { code: 'BTE', name: 'Bharatpur Junction', state: 'Rajasthan' },
  { code: 'ABR', name: 'Abu Road (Mount Abu)', state: 'Rajasthan' },
  { code: 'JSM', name: 'Jaisalmer', state: 'Rajasthan' },
  { code: 'COR', name: 'Chittorgarh Junction', state: 'Rajasthan' },
  { code: 'BHL', name: 'Bhilwara', state: 'Rajasthan' },
  { code: 'FL', name: 'Phulera Junction', state: 'Rajasthan' },
  { code: 'SGNR', name: 'Shri Ganganagar', state: 'Rajasthan' },
  { code: 'LGH', name: 'Lalgarh Junction', state: 'Rajasthan' },
  { code: 'ALW', name: 'Alwar Junction', state: 'Rajasthan' },

  // Madhya Pradesh
  { code: 'BPL', name: 'Bhopal Junction', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati (Habibganj Bhopal)', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', state: 'Madhya Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur Junction', state: 'Madhya Pradesh' },
  { code: 'UJN', name: 'Ujjain Junction', state: 'Madhya Pradesh' },
  { code: 'RTM', name: 'Ratlam Junction', state: 'Madhya Pradesh' },
  { code: 'ET', name: 'Itarsi Junction', state: 'Madhya Pradesh' },
  { code: 'KTE', name: 'Katni Junction', state: 'Madhya Pradesh' },
  { code: 'STA', name: 'Satna Junction', state: 'Madhya Pradesh' },
  { code: 'REWA', name: 'Rewa', state: 'Madhya Pradesh' },
  { code: 'KHAND', name: 'Khandwa Junction', state: 'Madhya Pradesh' },
  { code: 'BINA', name: 'Bina Junction', state: 'Madhya Pradesh' },
  { code: 'SGO', name: 'Saugor', state: 'Madhya Pradesh' },
  { code: 'DMO', name: 'Damoh', state: 'Madhya Pradesh' },

  // Telangana & Andhra Pradesh
  { code: 'SC', name: 'Secunderabad Junction', state: 'Telangana' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', state: 'Telangana' },
  { code: 'KCG', name: 'Kacheguda (Hyderabad)', state: 'Telangana' },
  { code: 'KZJ', name: 'Kazipet Junction', state: 'Telangana' },
  { code: 'WL', name: 'Warangal', state: 'Telangana' },
  { code: 'KRNT', name: 'Kurnool City', state: 'Andhra Pradesh' },
  { code: 'BZA', name: 'Vijayawada Junction', state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', state: 'Andhra Pradesh' },
  { code: 'TPTY', name: 'Tirupati Main', state: 'Andhra Pradesh' },
  { code: 'RU', name: 'Renigunta Junction', state: 'Andhra Pradesh' },
  { code: 'GNT', name: 'Guntur Junction', state: 'Andhra Pradesh' },
  { code: 'RJY', name: 'Rajahmundry', state: 'Andhra Pradesh' },
  { code: 'SLO', name: 'Samalkot Junction', state: 'Andhra Pradesh' },
  { code: 'EE', name: 'Eluru', state: 'Andhra Pradesh' },
  { code: 'OGL', name: 'Ongole', state: 'Andhra Pradesh' },
  { code: 'NLR', name: 'Nellore', state: 'Andhra Pradesh' },
  { code: 'GDR', name: 'Gudur Junction', state: 'Andhra Pradesh' },
  { code: 'KDP', name: 'Kadapa (Cuddapah)', state: 'Andhra Pradesh' },
  { code: 'HX', name: 'Yerraguntla', state: 'Andhra Pradesh' },
  { code: 'GTL', name: 'Guntakal Junction', state: 'Andhra Pradesh' },
  { code: 'ATP', name: 'Anantapur', state: 'Andhra Pradesh' },

  // Kerala
  { code: 'TVC', name: 'Thiruvananthapuram Central (Trivandrum)', state: 'Kerala' },
  { code: 'ERS', name: 'Ernakulam Junction (South - Kochi)', state: 'Kerala' },
  { code: 'ERN', name: 'Ernakulam Town (North - Kochi)', state: 'Kerala' },
  { code: 'CLT', name: 'Kozhikode (Calicut)', state: 'Kerala' },
  { code: 'TCR', name: 'Thrissur', state: 'Kerala' },
  { code: 'SRR', name: 'Shoranur Junction', state: 'Kerala' },
  { code: 'PGT', name: 'Palakkad Junction (Palghat)', state: 'Kerala' },
  { code: 'QLN', name: 'Kollam Junction (Quilon)', state: 'Kerala' },
  { code: 'ALLP', name: 'Alappuzha (Alleppey)', state: 'Kerala' },
  { code: 'KTYM', name: 'Kottayam', state: 'Kerala' },
  { code: 'CAN', name: 'Kannur', state: 'Kerala' },
  { code: 'KGQ', name: 'Kasaragod', state: 'Kerala' },

  // Odisha
  { code: 'BBS', name: 'Bhubaneswar', state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack Junction', state: 'Odisha' },
  { code: 'PURI', name: 'Puri Terminus', state: 'Odisha' },
  { code: 'KUR', name: 'Khurda Road Junction', state: 'Odisha' },
  { code: 'BAM', name: 'Brahmapur', state: 'Odisha' },
  { code: 'ROU', name: 'Rourkela Junction', state: 'Odisha' },
  { code: 'SBP', name: 'Sambalpur Junction', state: 'Odisha' },
  { code: 'BLS', name: 'Baleshwar (Balasore)', state: 'Odisha' },
  { code: 'BHC', name: 'Bhadrak', state: 'Odisha' },
  { code: 'JJKR', name: 'Jajpur Keonjhar Road', state: 'Odisha' },
  { code: 'JSG', name: 'Jharsuguda Junction', state: 'Odisha' },

  // Punjab, Haryana & Chandigarh
  { code: 'CDG', name: 'Chandigarh Junction', state: 'Chandigarh' },
  { code: 'ASR', name: 'Amritsar Junction', state: 'Punjab' },
  { code: 'LDH', name: 'Ludhiana Junction', state: 'Punjab' },
  { code: 'JUC', name: 'Jalandhar City Junction', state: 'Punjab' },
  { code: 'JRC', name: 'Jalandhar Cantt', state: 'Punjab' },
  { code: 'BTI', name: 'Bathinda Junction', state: 'Punjab' },
  { code: 'PTA', name: 'Patiala', state: 'Punjab' },
  { code: 'UMB', name: 'Ambala Cantt Junction', state: 'Haryana' },
  { code: 'PNP', name: 'Panipat Junction', state: 'Haryana' },
  { code: 'KUN', name: 'Karnal', state: 'Haryana' },
  { code: 'KKDE', name: 'Kurukshetra Junction', state: 'Haryana' },
  { code: 'ROK', name: 'Rohtak Junction', state: 'Haryana' },
  { code: 'HSR', name: 'Hisar Junction', state: 'Haryana' },
  { code: 'RE', name: 'Rewari Junction', state: 'Haryana' },
  { code: 'KLK', name: 'Kalka', state: 'Haryana' },

  // Jammu & Kashmir
  { code: 'JAT', name: 'Jammu Tawi', state: 'Jammu & Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', state: 'Jammu & Kashmir' },
  { code: 'UHP', name: 'Martyr Captain Tushar Mahajan (Udhampur)', state: 'Jammu & Kashmir' },

  // Uttarakhand & Himachal Pradesh
  { code: 'DDN', name: 'Dehradun', state: 'Uttarakhand' },
  { code: 'HW', name: 'Haridwar Junction', state: 'Uttarakhand' },
  { code: 'RK', name: 'Roorkee', state: 'Uttarakhand' },
  { code: 'KGM', name: 'Kathgodam', state: 'Uttarakhand' },
  { code: 'LKU', name: 'Lalkuan Junction', state: 'Uttarakhand' },

  // Jharkhand & Chhattisgarh
  { code: 'RNC', name: 'Ranchi Junction', state: 'Jharkhand' },
  { code: 'HTE', name: 'Hatia', state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Junction (Jamshedpur)', state: 'Jharkhand' },
  { code: 'DHN', name: 'Dhanbad Junction', state: 'Jharkhand' },
  { code: 'BKSC', name: 'Bokaro Steel City', state: 'Jharkhand' },
  { code: 'JSME', name: 'Jasidih Junction (Deoghar)', state: 'Jharkhand' },
  { code: 'KQR', name: 'Koderma Junction', state: 'Jharkhand' },
  { code: 'R', name: 'Raipur Junction', state: 'Chhattisgarh' },
  { code: 'BSP', name: 'Bilaspur Junction', state: 'Chhattisgarh' },
  { code: 'DURG', name: 'Durg Junction', state: 'Chhattisgarh' },
  { code: 'RIG', name: 'Raigarh', state: 'Chhattisgarh' },

  // Goa
  { code: 'MAO', name: 'Madgaon Junction (Goa)', state: 'Goa' },
  { code: 'KRMI', name: 'Karmali (Goa)', state: 'Goa' },
  { code: 'VSG', name: 'Vasco-da-Gama', state: 'Goa' },
  { code: 'THVM', name: 'Thivim (North Goa)', state: 'Goa' },

  // Assam & North East
  { code: 'GHY', name: 'Guwahati Junction', state: 'Assam' },
  { code: 'KYQ', name: 'Kamakhya Junction (Guwahati)', state: 'Assam' },
  { code: 'DBRG', name: 'Dibrugarh', state: 'Assam' },
  { code: 'NTSK', name: 'New Tinsukia Junction', state: 'Assam' },
  { code: 'SCL', name: 'Silchar', state: 'Assam' },
  { code: 'NBQ', name: 'New Bongaigaon Junction', state: 'Assam' },
  { code: 'LMG', name: 'Lumding Junction', state: 'Assam' },
  { code: 'AGTL', name: 'Agartala', state: 'Tripura' },
  { code: 'NHLN', name: 'Naharlagun (Itanagar)', state: 'Arunachal Pradesh' }
];

/**
 * Filter stations by search term (code, name, or state)
 */
export function searchStations(query, limit = 15) {
  if (!query || !query.trim()) {
    return INDIAN_STATIONS.slice(0, limit);
  }
  const clean = query.toLowerCase().trim();
  const matches = INDIAN_STATIONS.filter(stn => 
    stn.code.toLowerCase().includes(clean) ||
    stn.name.toLowerCase().includes(clean) ||
    stn.state.toLowerCase().includes(clean)
  );

  // Exact code match at top
  matches.sort((a, b) => {
    if (a.code.toLowerCase() === clean) return -1;
    if (b.code.toLowerCase() === clean) return 1;
    if (a.code.toLowerCase().startsWith(clean)) return -1;
    if (b.code.toLowerCase().startsWith(clean)) return 1;
    return 0;
  });

  return matches.slice(0, limit);
}

/**
 * Helper to populate traditional datalist if needed
 */
export function populateStationDatalist(datalistId = 'stations-list') {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;
  datalist.innerHTML = '';
  INDIAN_STATIONS.forEach(stn => {
    const opt = document.createElement('option');
    opt.value = `${stn.code} - ${stn.name} (${stn.state})`;
    datalist.appendChild(opt);
  });
}
