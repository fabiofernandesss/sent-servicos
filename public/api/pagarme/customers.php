<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://www.sent.eng.br');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações do PagarMe
$PAGARME_API_URL = 'https://api.pagar.me/core/v5';
$PAGARME_SECRET_KEY = 'sk_83744d2260054f53bc9eb5f2934d7e42';
$AUTH_HEADER = 'Basic ' . base64_encode($PAGARME_SECRET_KEY . ':');

function makeRequest($url, $method = 'GET', $data = null) {
    global $AUTH_HEADER;
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: ' . $AUTH_HEADER,
            'Accept: application/json'
        ],
    ]);
    
    if ($data) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    return ['response' => $response, 'httpCode' => $httpCode];
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Buscar cliente por documento
        $document = $_GET['document'] ?? '';
        
        if (empty($document)) {
            http_response_code(400);
            echo json_encode(['error' => 'Document is required']);
            exit();
        }

        $result = makeRequest($PAGARME_API_URL . '/customers?document=' . $document);
        
        http_response_code($result['httpCode']);
        echo $result['response'];
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Criar cliente
        $input = file_get_contents('php://input');
        $customerData = json_decode($input, true);
        
        if (!$customerData) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            exit();
        }

        $result = makeRequest($PAGARME_API_URL . '/customers', 'POST', $customerData);
        
        http_response_code($result['httpCode']);
        echo $result['response'];
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}
?>
