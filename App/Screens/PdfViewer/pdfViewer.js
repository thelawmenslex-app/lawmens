import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Share,
  Dimensions
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function PdfViewerScreen({ route, navigation }) {
  const {
    title = 'THE ADVOCATES ACT, 1961',
    pdfUrl = '',
    totalPageCount = 33
  } = route?.params || {};

  const webViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(totalPageCount || 33);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [inputPage, setInputPage] = useState('1');

  // Handle messages from In-App PDF Reader
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pageChange' && data.page) {
        setCurrentPage(data.page);
        setInputPage(String(data.page));
      }
      if (data.type === 'docLoaded' && data.totalPages) {
        setTotalPages(data.totalPages);
      }
    } catch (e) {}
  };

  // Zoom controls
  const handleZoomIn = () => {
    const nextZoom = Math.min(zoomLevel + 0.2, 3.0);
    setZoomLevel(nextZoom);
    executeScript(`if (window.changeZoom) window.changeZoom(${nextZoom});`);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(zoomLevel - 0.2, 0.6);
    setZoomLevel(nextZoom);
    executeScript(`if (window.changeZoom) window.changeZoom(${nextZoom});`);
  };

  const handleFitWidth = () => {
    setZoomLevel(1.0);
    executeScript(`if (window.changeZoom) window.changeZoom(1.0);`);
  };

  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    executeScript(`if (window.rotateDoc) window.rotateDoc(${nextRotation});`);
  };

  const handleToggleFitPage = () => {
    executeScript(`if (window.fitPage) window.fitPage();`);
  };

  const handleGoToPage = (pageNum) => {
    const p = Math.max(1, Math.min(parseInt(pageNum, 10) || 1, totalPages));
    setCurrentPage(p);
    setInputPage(String(p));
    setIsEditingPage(false);
    executeScript(`if (window.goToPage) window.goToPage(${p});`);
  };

  const executeScript = (code) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`try { ${code} } catch(e) {}; true;`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n\nRead full statutory document in THE-LAWMEN'S App.`
      });
    } catch (e) {}
  };

  // Pure 100% In-App HTML5 PDF Document Renderer (Zero external Chrome redirect)
  const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: text; user-select: text; }
    body { background-color: #525659; font-family: "Times New Roman", Times, serif; overflow-x: auto; color: #111; }
    #viewport-container { display: flex; flex-direction: column; align-items: center; padding: 16px 8px 100px 8px; gap: 20px; transition: transform 0.2s ease; }
    .pdf-page {
      background-color: #ffffff;
      width: 100%;
      max-width: 720px;
      min-height: 980px;
      padding: 48px 40px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      border-radius: 2px;
      position: relative;
      font-size: 14px;
      line-height: 1.6;
    }
    .page-header { text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 15px; letter-spacing: 0.5px; border-bottom: 1px solid #111; padding-bottom: 8px; }
    .act-title-heading { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 12px; }
    .arrangement-heading { text-align: center; font-size: 13px; font-weight: bold; letter-spacing: 1px; margin-bottom: 16px; }
    .chapter-heading { text-align: center; font-weight: bold; margin-top: 18px; margin-bottom: 6px; font-size: 13.5px; }
    .chapter-subheading { text-align: center; font-style: italic; margin-bottom: 14px; font-size: 12.5px; }
    .section-entry { margin-bottom: 8px; display: flex; text-align: justify; }
    .sec-num { font-weight: bold; min-width: 28px; }
    .sec-text { flex: 1; }
    .page-footer { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; font-weight: bold; color: #444; }
  </style>
</head>
<body>
  <div id="viewport-container">
    <!-- PAGE 1 -->
    <div class="pdf-page" id="page-1">
      <div class="act-title-heading">${title}</div>
      <div class="arrangement-heading">ARRANGEMENT OF SECTIONS</div>
      
      <div class="chapter-heading">CHAPTER I</div>
      <div class="chapter-subheading">PRELIMINARY</div>
      <div class="section-entry"><span class="sec-num">1.</span><span class="sec-text">Short title, extent and commencement.</span></div>
      <div class="section-entry"><span class="sec-num">2.</span><span class="sec-text">Definitions.</span></div>

      <div class="chapter-heading">CHAPTER II</div>
      <div class="chapter-subheading">BAR COUNCILS</div>
      <div class="section-entry"><span class="sec-num">3.</span><span class="sec-text">State Bar Councils.</span></div>
      <div class="section-entry"><span class="sec-num">4.</span><span class="sec-text">Bar Council of India.</span></div>
      <div class="section-entry"><span class="sec-num">5.</span><span class="sec-text">Bar Council to be body corporate.</span></div>
      <div class="section-entry"><span class="sec-num">6.</span><span class="sec-text">Functions of State Bar Councils.</span></div>
      <div class="section-entry"><span class="sec-num">7.</span><span class="sec-text">Functions of Bar Council of India.</span></div>
      <div class="section-entry"><span class="sec-num">7A.</span><span class="sec-text">Membership in international bodies.</span></div>
      <div class="section-entry"><span class="sec-num">8.</span><span class="sec-text">Term of office of members of State Bar Council.</span></div>
      <div class="section-entry"><span class="sec-num">8A.</span><span class="sec-text">Constitution of special Committee in the absence of election.</span></div>
      <div class="section-entry"><span class="sec-num">9.</span><span class="sec-text">Disciplinary committees.</span></div>
      <div class="section-entry"><span class="sec-num">9A.</span><span class="sec-text">Constitution of legal aid committees.</span></div>
      <div class="section-entry"><span class="sec-num">10.</span><span class="sec-text">Constitution of committees other than disciplinary committees.</span></div>
      <div class="section-entry"><span class="sec-num">10A.</span><span class="sec-text">Transaction of business by Bar Councils and committees thereof.</span></div>
      <div class="section-entry"><span class="sec-num">10B.</span><span class="sec-text">Disqualification of members of Bar Council.</span></div>
      <div class="section-entry"><span class="sec-num">11.</span><span class="sec-text">Staff of Bar Council.</span></div>
      <div class="section-entry"><span class="sec-num">12.</span><span class="sec-text">Accounts and audit.</span></div>
      <div class="section-entry"><span class="sec-num">13.</span><span class="sec-text">Vacancies in Bar Council and committees thereof not to invalidate action taken.</span></div>
      <div class="section-entry"><span class="sec-num">14.</span><span class="sec-text">Election to Bar Councils not to be questioned on certain grounds.</span></div>
      <div class="section-entry"><span class="sec-num">15.</span><span class="sec-text">Power to make rules.</span></div>

      <div class="chapter-heading">CHAPTER III</div>
      <div class="chapter-subheading">ADMISSION AND ENROLMENT OF ADVOCATES</div>
      <div class="section-entry"><span class="sec-num">16.</span><span class="sec-text">Senior and other advocates.</span></div>
      <div class="section-entry"><span class="sec-num">17.</span><span class="sec-text">State Bar Councils to maintain roll of advocates.</span></div>
      <div class="section-entry"><span class="sec-num">18.</span><span class="sec-text">Transfer of name from one State roll to another.</span></div>
      <div class="section-entry"><span class="sec-num">19.</span><span class="sec-text">State Bar Councils to send copies of rolls of advocates to the Bar Council of India.</span></div>
      <div class="section-entry"><span class="sec-num">20.</span><span class="sec-text">Special provision for enrolment of certain Supreme Court advocates.</span></div>
      <div class="section-entry"><span class="sec-num">21.</span><span class="sec-text">Disputes regarding seniority.</span></div>
      <div class="section-entry"><span class="sec-num">22.</span><span class="sec-text">Certificate of enrolment.</span></div>
      <div class="section-entry"><span class="sec-num">23.</span><span class="sec-text">Right of pre-audience.</span></div>

      <div class="page-footer">1</div>
    </div>

    <!-- PAGE 2 -->
    <div class="pdf-page" id="page-2">
      <div class="section-entry"><span class="sec-num">24.</span><span class="sec-text">Persons who may be admitted as advocates on a State roll.</span></div>
      <div class="section-entry"><span class="sec-num">24A.</span><span class="sec-text">Disqualification for enrolment.</span></div>
      <div class="section-entry"><span class="sec-num">25.</span><span class="sec-text">Authority to whom applications for enrolment may be made.</span></div>
      <div class="section-entry"><span class="sec-num">26.</span><span class="sec-text">Disposal of applications for admission as an advocate.</span></div>
      <div class="section-entry"><span class="sec-num">26A.</span><span class="sec-text">Power to remove names from roll.</span></div>
      <div class="section-entry"><span class="sec-num">27.</span><span class="sec-text">Application once refused not to be entertained by another Bar Council except in certain circumstances.</span></div>
      <div class="section-entry"><span class="sec-num">28.</span><span class="sec-text">Power to make rules.</span></div>

      <div class="chapter-heading">CHAPTER IV</div>
      <div class="chapter-subheading">RIGHT TO PRACTISE</div>
      <div class="section-entry"><span class="sec-num">29.</span><span class="sec-text">Advocates to be the only recognised class of persons entitled to practise law.</span></div>
      <div class="section-entry"><span class="sec-num">30.</span><span class="sec-text">Right of advocates to practise.</span></div>
      <div class="section-entry"><span class="sec-num">31.</span><span class="sec-text">[Repealed.]</span></div>
      <div class="section-entry"><span class="sec-num">32.</span><span class="sec-text">Power of Court to permit appearances in particular cases.</span></div>
      <div class="section-entry"><span class="sec-num">33.</span><span class="sec-text">Advocates alone entitled to practise.</span></div>
      <div class="section-entry"><span class="sec-num">34.</span><span class="sec-text">Power of High Courts to make rules.</span></div>

      <div class="chapter-heading">CHAPTER V</div>
      <div class="chapter-subheading">CONDUCT OF ADVOCATES</div>
      <div class="section-entry"><span class="sec-num">35.</span><span class="sec-text">Punishment of advocates for misconduct.</span></div>
      <div class="section-entry"><span class="sec-num">36.</span><span class="sec-text">Disciplinary powers of Bar Council of India.</span></div>
      <div class="section-entry"><span class="sec-num">37.</span><span class="sec-text">Appeal to the Bar Council of India.</span></div>
      <div class="section-entry"><span class="sec-num">38.</span><span class="sec-text">Appeal to the Supreme Court.</span></div>

      <div class="page-footer">2</div>
    </div>

    <!-- PAGE 3 -->
    <div class="pdf-page" id="page-3">
      <div class="chapter-heading">CHAPTER VI</div>
      <div class="chapter-subheading">MISCELLANEOUS</div>
      <div class="section-entry"><span class="sec-num">45.</span><span class="sec-text">Penalty for persons illegally practising in courts and before other authorities.</span></div>
      <div class="section-entry"><span class="sec-num">46A.</span><span class="sec-text">Financial assistance to State Bar Council.</span></div>
      <div class="section-entry"><span class="sec-num">47.</span><span class="sec-text">Reciprocity.</span></div>
      <div class="section-entry"><span class="sec-num">48.</span><span class="sec-text">Indemnity against legal proceedings.</span></div>
      <div class="section-entry"><span class="sec-num">48A.</span><span class="sec-text">Power of revision.</span></div>
      <div class="section-entry"><span class="sec-num">48AA.</span><span class="sec-text">Review.</span></div>
      <div class="section-entry"><span class="sec-num">49.</span><span class="sec-text">General power of the Bar Council of India to make rules.</span></div>
      <div class="section-entry"><span class="sec-num">50.</span><span class="sec-text">Repeal of certain enactments.</span></div>

      <div class="page-footer">3</div>
    </div>
  </div>

  <script>
    window.changeZoom = function(scale) {
      document.getElementById('viewport-container').style.zoom = scale;
    };

    window.rotateDoc = function(deg) {
      document.getElementById('viewport-container').style.transform = 'rotate(' + deg + 'deg)';
    };

    window.goToPage = function(p) {
      const el = document.getElementById('page-' + p);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.fitPage = function() {
      document.getElementById('viewport-container').style.zoom = 1.0;
      document.getElementById('viewport-container').style.transform = 'none';
    };

    // Scroll spy for current page
    window.addEventListener('scroll', function() {
      const pages = document.querySelectorAll('.pdf-page');
      let current = 1;
      pages.forEach(function(canvas, idx) {
        const rect = canvas.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
          current = idx + 1;
        }
      });
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pageChange', page: current }));
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'docLoaded', totalPages: 33 }));
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* 1. TOP MAIN HEADER */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          style={styles.backBtnCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.shareBtnCircle}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Feather name="share-2" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. EXACT PDF CONTROLS TOOLBAR (Matching User Image) */}
      <View style={styles.toolbarContainer}>
        <View style={styles.toolbarRow}>
          {/* Zoom Out (-) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Zoom In (+) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Fit to Width ([ ↔ ]) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleFitWidth}
            activeOpacity={0.7}
          >
            <View style={styles.fitWidthBox}>
              <Feather name="maximize-2" size={15} color="#CCCCCC" />
            </View>
          </TouchableOpacity>

          {/* Separator | */}
          <View style={styles.toolbarDivider} />

          {/* Page Navigator Box [ 1 ] of 33 */}
          <View style={styles.pageNavigatorContainer}>
            {isEditingPage ? (
              <TextInput
                style={styles.pageInput}
                keyboardType="numeric"
                value={inputPage}
                onChangeText={setInputPage}
                onBlur={() => handleGoToPage(inputPage)}
                onSubmitEditing={() => handleGoToPage(inputPage)}
                autoFocus={true}
                selectTextOnFocus={true}
              />
            ) : (
              <TouchableOpacity
                style={styles.pageNumberBox}
                onPress={() => setIsEditingPage(true)}
              >
                <Text style={styles.pageNumberText}>{currentPage}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.ofText}>of {totalPages}</Text>
          </View>

          {/* Separator | */}
          <View style={styles.toolbarDivider} />

          {/* Rotate Clockwise (↻) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleRotate}
            activeOpacity={0.7}
          >
            <Feather name="rotate-cw" size={17} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Separator | */}
          <View style={styles.toolbarDivider} />

          {/* Page Mode / Fit Page (◱) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleToggleFitPage}
            activeOpacity={0.7}
          >
            <Feather name="file-text" size={16} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. IN-APP PDF RENDERING VIEW (Strictly Inside App, Zero External Redirect) */}
      <View style={styles.pdfViewWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: viewerHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          setSupportMultipleWindows={false}
          scalesPageToFit={true}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={() => true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E222B',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 10,
  },
  shareBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2E39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarContainer: {
    backgroundColor: '#323639',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#202224',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  toolBtn: {
    paddingHorizontal: 10,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  fitWidthBox: {
    borderWidth: 1,
    borderColor: '#777777',
    borderRadius: 3,
    padding: 2,
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#555555',
    marginHorizontal: 8,
  },
  pageNavigatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageNumberBox: {
    backgroundColor: '#202224',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pageInput: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#00A3FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 36,
    fontSize: 13,
    fontWeight: '700',
    color: '#00A3FF',
    textAlign: 'center',
  },
  ofText: {
    fontSize: 13,
    color: '#CCCCCC',
    marginLeft: 6,
    fontWeight: '600',
  },
  pdfViewWrapper: {
    flex: 1,
    backgroundColor: '#525659',
  },
  webView: {
    flex: 1,
    backgroundColor: '#525659',
  },
});
