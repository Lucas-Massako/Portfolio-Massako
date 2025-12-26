<?php
// send_contact.php

// 1. Configuration
require_once 'config.php';

// Si le fichier config n'existe pas (ex: sur GitHub), on met une erreur ou une valeur vide
if (!isset($webhookurl)) {
    die(json_encode(["status" => "error", "message" => "Erreur de configuration serveur"]));
}
// Vérifier si c'est bien une requête POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 2. Récupération et nettoyage des données (Sécurité anti-XSS)
    $name = htmlspecialchars(strip_tags($_POST['name']));
    $email = htmlspecialchars(strip_tags($_POST['email']));
    $message = htmlspecialchars(strip_tags($_POST['message']));

    // 3. Préparation du message pour Discord (Format JSON)
    // On utilise les "Embeds" pour faire joli
    $json_data = json_encode([
        "username" => "Portfolio Bot",
        "avatar_url" => "https://lucas-webdev.fr/avatar.png", // Optionnel
        "embeds" => [
            [
                "title" => "📩 Nouveau Message reçu !",
                "type" => "rich",
                "color" => hexdec("3b82f6"), // La couleur bleue de votre site
                "fields" => [
                    [
                        "name" => "Nom",
                        "value" => $name,
                        "inline" => true
                    ],
                    [
                        "name" => "Email",
                        "value" => $email,
                        "inline" => true
                    ],
                    [
                        "name" => "Message",
                        "value" => $message
                    ]
                ],
                "footer" => [
                    "text" => "Envoyé depuis le Portfolio le " . date("d/m/Y à H:i")
                ]
            ]
        ]
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );

    // 4. Envoi à Discord via cURL (Comme un pro du réseau !)
    $ch = curl_init($webhookurl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $response = curl_exec($ch);
    curl_close($ch);

    // 5. Réponse au Javascript
    echo json_encode(["status" => "success", "message" => "Message envoyé !"]);

} else {
    echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
}


?>