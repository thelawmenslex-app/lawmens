import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Share,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function PdfViewerScreen({ route, navigation }) {
  const {
    title = 'Minor Act Document',
    pdfUrl = '',
    actId = '',
    totalPageCount = 34
  } = route?.params || {};

  const webViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(totalPageCount);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [inputPage, setInputPage] = useState('1');

  // Handle messages from PDF.js inside WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pageChange' && data.page) {
        setCurrentPage(data.page);
        setInputPage(String(data.page));
      }
      if (data.type === 'docLoaded' && data.totalPages) {
        setTotalPages(data.totalPages);
        setLoading(false);
      }
      if (data.type === 'error') {
        setLoading(false);
      }
    } catch (e) {}
  };

  // Zoom In (+)
  const handleZoomIn = () => {
    const nextZoom = Math.min(zoomPercent + 20, 250);
    setZoomPercent(nextZoom);
    executeScript(`if (window.setZoom) window.setZoom(${nextZoom / 100});`);
  };

  // Zoom Out (-)
  const handleZoomOut = () => {
    const nextZoom = Math.max(zoomPercent - 20, 60);
    setZoomPercent(nextZoom);
    executeScript(`if (window.setZoom) window.setZoom(${nextZoom / 100});`);
  };

  // Fit to Width ([ ↔ ])
  const handleFitWidth = () => {
    setZoomPercent(100);
    executeScript(`if (window.setZoom) window.setZoom(1.0);`);
  };

  // Rotate 90 deg (↻)
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    executeScript(`if (window.rotateDoc) window.rotateDoc(${nextRotation});`);
  };

  // Go to page
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
        message: `${title}\n\nShared from THE-LAWMEN'S Application.`
      });
    } catch (e) {}
  };

  // Embedded PDF.js Engine that fetches and renders the EXACT backend PDF file
  const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
  <title>${title}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background-color: #383B40; overflow-x: auto; width: 100%; min-height: 100%; font-family: -apple-system, sans-serif; }
    #container { display: flex; flex-direction: column; align-items: center; padding: 14px 6px 100px 6px; gap: 14px; transition: transform 0.2s ease; transform-origin: top center; }
    .page-wrapper { position: relative; background: #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.45); border-radius: 2px; }
    .page-canvas { display: block; max-width: 98vw; height: auto; }
    #loader { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(24,26,32,0.9); padding: 18px 24px; border-radius: 12px; color: #ffffff; font-size: 14px; font-weight: 700; text-align: center; z-index: 999; }
  </style>
</head>
<body>
  <div id="loader">Loading Backend PDF Document...</div>
  <div id="container"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfUrl = '${pdfUrl}';
    let pdfDoc = null;
    let baseScale = window.devicePixelRatio > 1 ? 1.5 : 1.2;
    let currentZoom = 1.0;
    let currentRotation = 0;

    function renderPage(num) {
      pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: baseScale * currentZoom, rotation: currentRotation });
        
        let wrapper = document.getElementById('page-wrap-' + num);
        let canvas;
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.className = 'page-wrapper';
          wrapper.id = 'page-wrap-' + num;
          canvas = document.createElement('canvas');
          canvas.className = 'page-canvas';
          canvas.id = 'canvas-' + num;
          wrapper.appendChild(canvas);
          document.getElementById('container').appendChild(wrapper);
        } else {
          canvas = document.getElementById('canvas-' + num);
        }

        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        page.render(renderContext).promise.then(function() {
          if (num === 1) {
            document.getElementById('loader').style.display = 'none';
          }
        });
      });
    }

    pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
      pdfDoc = pdf;
      const total = pdf.numPages;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'docLoaded', totalPages: total }));
      for (let i = 1; i <= total; i++) {
        renderPage(i);
      }
    }).catch(function(err) {
      console.error('PDF load error:', err);
      document.getElementById('loader').innerText = 'Rendering statutory text...';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message }));
    });

    window.setZoom = function(z) {
      currentZoom = z;
      document.getElementById('container').style.transform = 'scale(' + z + ')';
    };

    window.rotateDoc = function(deg) {
      currentRotation = deg;
      document.getElementById('container').style.transform = 'rotate(' + deg + 'deg)';
    };

    window.goToPage = function(p) {
      const el = document.getElementById('page-wrap-' + p);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Scroll spy
    window.addEventListener('scroll', function() {
      if (!pdfDoc) return;
      const wrappers = document.querySelectorAll('.page-wrapper');
      let current = 1;
      wrappers.forEach(function(wrap, idx) {
        const rect = wrap.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
          current = idx + 1;
        }
      });
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pageChange', page: current }));
    });
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* 1. TOP TITLE HEADER */}
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

      {/* 2. EXACT PDF CONTROLS TOOLBAR (Matching [ 5 ] / 60 | - 100% + | ) */}
      <View style={styles.toolbarContainer}>
        <View style={styles.toolbarRow}>
          {/* Page Navigator [ 5 ] / 60 */}
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
            <Text style={styles.ofText}>/ {totalPages}</Text>
          </View>

          {/* Separator | */}
          <View style={styles.toolbarDivider} />

          {/* Zoom Out (-) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={17} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Zoom Percent Box [ 100% ] */}
          <TouchableOpacity
            style={styles.zoomPercentBox}
            onPress={handleFitWidth}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomPercentText}>{zoomPercent}%</Text>
          </TouchableOpacity>

          {/* Zoom In (+) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={17} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Separator | */}
          <View style={styles.toolbarDivider} />

          {/* Rotate 90 (↻) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleRotate}
            activeOpacity={0.7}
          >
            <Feather name="rotate-cw" size={16} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Fit to Width ([ ↔ ]) */}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleFitWidth}
            activeOpacity={0.7}
          >
            <Feather name="maximize-2" size={15} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. IN-APP PDF RENDERING VIEW */}
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
    backgroundColor: '#2B2E33',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2124',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  pageNavigatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  pageNumberBox: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#4B5563',
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
    fontWeight: '700',
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#4B5563',
    marginHorizontal: 8,
  },
  toolBtn: {
    paddingHorizontal: 8,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPercentBox: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  zoomPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pdfViewWrapper: {
    flex: 1,
    backgroundColor: '#383B40',
  },
  webView: {
    flex: 1,
    backgroundColor: '#383B40',
  },
});
