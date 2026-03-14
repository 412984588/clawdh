import 'package:flutter_tts/flutter_tts.dart';

class TtsService {
  final FlutterTts _flutterTts = FlutterTts();
  bool _isPlaying = false;

  bool get isPlaying => _isPlaying;

  Future<void> init() async {
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setPitch(1.0);

    _flutterTts.setStartHandler(() => _isPlaying = true);
    _flutterTts.setCompletionHandler(() => _isPlaying = false);
    _flutterTts.setErrorHandler((msg) => _isPlaying = false);
    _flutterTts.setCancelHandler(() => _isPlaying = false);
    _flutterTts.setPauseHandler(() => _isPlaying = false);
    _flutterTts.setContinueHandler(() => _isPlaying = true);
  }

  Future<void> speak(String text, String language) async {
    await _flutterTts.setLanguage(language); // 'zh-HK' for Cantonese, 'zh-CN' for Mandarin
    await _flutterTts.speak(text);
  }

  Future<void> stop() async {
    await _flutterTts.stop();
    _isPlaying = false;
  }

  Future<void> pause() async {
    await _flutterTts.pause();
    _isPlaying = false;
  }
}
