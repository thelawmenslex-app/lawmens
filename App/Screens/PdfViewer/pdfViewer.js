import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Share,
  Platform,
  Dimensions
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function PdfViewerScreen({ route, navigation }) {
  const {
    title = 'Legal Act Document',
    pdfUrl = 'https://www.the-lawmens.com/uploads/minor-acts/sample.pdf',
    totalPageCount = 33
  } = route?.params || {};

  const webViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(totalPageCount);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [inputPage, setInputPage] = useState('1');

  // Handle message from WebView (PDF.js page updates)
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
    } catch (e) {}
  };

  // Zoom controls
  const handleZoomIn = () => {
    const nextZoom = Math.min(zoomLevel + 0.25, 3.0);
    setZoomLevel(nextZoom);
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.pdfViewer.currentScale = ${nextZoom}; } else { document.body.style.zoom = '${nextZoom}'; }`);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(zoomLevel - 0.25, 0.5);
    setZoomLevel(nextZoom);
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.pdfViewer.currentScale = ${nextZoom}; } else { document.body.style.zoom = '${nextZoom}'; }`);
  };

  const handleFitWidth = () => {
    setZoomLevel(1.0);
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.pdfViewer.currentScaleValue = 'page-width'; } else { document.body.style.zoom = '1.0'; }`);
  };

  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.rotatePages(90); } else { document.getElementById('pdf-container').style.transform = 'rotate(${nextRotation}deg)'; }`);
  };

  const handleToggleFitPage = () => {
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.pdfViewer.currentScaleValue = 'page-fit'; }`);
  };

  const handleGoToPage = (pageNum) => {
    const p = Math.max(1, Math.min(parseInt(pageNum, 10) || 1, totalPages));
    setCurrentPage(p);
    setInputPage(String(p));
    setIsEditingPage(false);
    executeScript(`if (window.PDFViewerApplication) { window.PDFViewerApplication.page = ${p}; }`);
  };

  const executeScript = (code) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`try { ${code} } catch(e) {}; true;`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\nDocument URL: ${pdfUrl}\n\nShared via THE-LAWMEN'S App`
      });
    } catch (e) {}
  };

  // Embedded Modern PDF.js HTML Viewer
  const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes">
  <title>${title}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #525659; overflow-x: auto; font-family: -apple-system, sans-serif; }
    #pdf-container { display: flex; flex-direction: column; align-items: center; padding: 12px 0 60px 0; gap: 14px; }
    .pdf-page-canvas { box-shadow: 0 4px 12px rgba(0,0,0,0.3); background-color: #ffffff; max-width: 96vw; height: auto; border-radius: 4px; }
    #loading-spinner { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-size: 16px; font-weight: 600; text-align: center; }
  </style>
</head>
<body>
  <div id="loading-spinner">Loading PDF Document...</div>
  <div id="pdf-container"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const url = '${pdfUrl}';
    let pdfDoc = null;
    let scale = 1.3;

    function renderPage(num) {
      pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        canvas.id = 'page-' + num;
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        page.render(renderContext).promise.then(function() {
          if (num === 1) {
            document.getElementById('loading-spinner').style.display = 'none';
          }
        });
        document.getElementById('pdf-container').appendChild(canvas);
      });
    }

    pdfjsLib.getDocument(url).promise.then(function(pdf) {
      pdfDoc = pdf;
      const total = pdf.numPages;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'docLoaded', totalPages: total }));
      for (let i = 1; i <= total; i++) {
        renderPage(i);
      }
    }).catch(function(err) {
      document.getElementById('loading-spinner').innerText = 'Loading fallback viewer...';
      window.location.href = 'https://docs.google.com/gview?embedded=true&url=' + encodeURIComponent(url);
    });

    // Scroll spy for current page
    window.addEventListener('scroll', function() {
      if (!pdfDoc) return;
      const pages = document.querySelectorAll('.pdf-page-canvas');
      let current = 1;
      pages.forEach(function(canvas, idx) {
        const rect = canvas.getBoundingClientRect();
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

      {/* 2. EXACT PDF CONTROLS TOOLBAR (Image from user) */}
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

      {/* 3. PDF RENDERING VIEW */}
      <View style={styles.pdfViewWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: viewerHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onMessage={handleMessage}
          onLoadEnd={() => setLoading(false)}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#00A3FF" />
              <Text style={styles.loadingText}>Rendering PDF Document...</Text>
            </View>
          )}
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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#525659',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
