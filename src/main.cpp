#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// ======================== CONFIG WIFI =========================

const char* ssid     = "Apto 304";
const char* password = "Ay.06112021";

// ======================== CONFIG API ==========================

const char* apiBaseUrl = "https://contador-pessoas-topaz.vercel.app";
const char* apiPath    = "/api/contador";

// ======================== PINOS SENSORES ======================

const int trig_esq = 4;
const int echo_esq = 5;

const int trig_dir = 6;
const int echo_dir = 7;

const int pino_led = 2;  // LED interno do ESP32-S3

// ======================== PARÂMETROS LÓGICOS ==================

const int LIMIAR_CM = 25;
const unsigned long JANELA_PASSAGEM_MS = 800;

// ======================== VARIÁVEIS ===========================

int contador = 0;

enum EstadoPassagem {
  IDLE = 0,
  ESQ_ATIVADO,
  DIR_ATIVADO
};

EstadoPassagem estadoAtual = IDLE;
unsigned long tInicioPassagem = 0;

WiFiClientSecure client;

// ======================== FUNÇÕES AUX =========================

long lerDistancia(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return 400;
  return duration * 0.034 / 2;
}

void feedbackVisual() {
  digitalWrite(pino_led, HIGH);
  delay(80);
  digitalWrite(pino_led, LOW);
}

void imprimirContagem(const char* tipo) {
  Serial.print(tipo);
  Serial.print(" | Total: ");
  Serial.println(contador);
}

// ============== GET inicial só para testar API =================

void testarGETAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[GET] WiFi não conectado");
    return;
  }

  client.setInsecure();
  HTTPClient http;

  String url = String(apiBaseUrl) + apiPath;
  Serial.print("[GET] ");
  Serial.println(url);

  if (!http.begin(client, url)) {
    Serial.println("[GET] Falha em http.begin()");
    return;
  }

  int httpCode = http.GET();
  Serial.print("[GET] Código HTTP: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    Serial.print("[GET] Resposta: ");
    Serial.println(http.getString());
  }

  http.end();
}

// ============== POST para enviar contador ======================

void enviarContadorParaAPI(int valor) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[POST] WiFi NÃO conectado");
    return;
  }

  client.setInsecure();
  HTTPClient http;

  String url = String(apiBaseUrl) + apiPath;
  Serial.print("[POST →] ");
  Serial.println(url);

  if (!http.begin(client, url)) {
    Serial.println("[POST] Falha em http.begin()");
    return;
  }

  http.addHeader("Content-Type", "application/json");

  String json = String("{\"pessoas\":") + valor + "}";
  Serial.print("[POST] JSON: ");
  Serial.println(json);

  int httpCode = http.POST(json);
  Serial.print("[POST] Código: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    Serial.print("[POST] Resposta: ");
    Serial.println(http.getString());
  }

  http.end();
}

// ======================== SETUP ===============================

void setup() {
  Serial.begin(115200);
  delay(300);

  Serial.println(" ===== Contador ESP32-S3 + Vercel (direcional) =====");

  pinMode(trig_esq, OUTPUT);
  pinMode(echo_esq, INPUT);
  pinMode(trig_dir, OUTPUT);
  pinMode(echo_dir, INPUT);
  pinMode(pino_led, OUTPUT);

  // WiFi
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 40) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi conectado! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Falha ao conectar.");
  }

  testarGETAPI();
}

// ======================== LOOP ================================

void loop() {
  long dist_esq = lerDistancia(trig_esq, echo_esq);
  long dist_dir = lerDistancia(trig_dir, echo_dir);

  bool ativ_esq = dist_esq < LIMIAR_CM;
  bool ativ_dir = dist_dir < LIMIAR_CM;

  unsigned long agora = millis();

  // Debug leve
  static unsigned long ultimoDebug = 0;
  if (agora - ultimoDebug > 500) {
    ultimoDebug = agora;
    Serial.print("ESQ ");
    Serial.print(dist_esq);
    Serial.print(" cm | DIR ");
    Serial.print(dist_dir);
    Serial.println(" cm");
  }

  switch (estadoAtual) {
    case IDLE:
      if (ativ_esq && !ativ_dir) {
        estadoAtual = ESQ_ATIVADO;
        tInicioPassagem = agora;
      } else if (ativ_dir && !ativ_esq) {
        estadoAtual = DIR_ATIVADO;
        tInicioPassagem = agora;
      }
      break;

    case ESQ_ATIVADO:
      if (agora - tInicioPassagem > JANELA_PASSAGEM_MS) {
        estadoAtual = IDLE;
      } else if (ativ_dir) {
        contador++;
        feedbackVisual();
        imprimirContagem("ENTRADA");
        enviarContadorParaAPI(contador);
        estadoAtual = IDLE;
      }
      break;

    case DIR_ATIVADO:
      if (agora - tInicioPassagem > JANELA_PASSAGEM_MS) {
        estadoAtual = IDLE;
      } else if (ativ_esq) {
        contador--;
        if (contador < 0) contador = 0;
        feedbackVisual();
        imprimirContagem("SAIDA");
        enviarContadorParaAPI(contador);
        estadoAtual = IDLE;
      }
      break;
  }

  delay(40);
}
