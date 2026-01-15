class MainActivity : AppCompatActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    val web = findViewById<WebView>(R.id.web)

    web.settings.javaScriptEnabled = true
    web.settings.mediaPlaybackRequiresUserGesture = false
    web.settings.domStorageEnabled = true

    web.webChromeClient = WebChromeClient()

    web.loadUrl("https://salimahmedov799-jpg.github.io/salim-AI/")
  }
}
