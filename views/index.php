<?php
header('Content-Type: text/html; charset=UTF-8'); 

try{
    
    setcookie('yourEmail',$email,time()+365*24*60*60);
    setcookie('name',$name,time()+365*24*60*60);

    if (!$errors) {
        $conn = new PDO("mysql:host=localhost;dbname=u41810", 'u41810', '3516685', array(PDO::ATTR_PERSISTENT => true));

        $user = $conn->prepare("INSERT INTO users SET name = ?, email = ?");

        $user -> execute([$_GET['yourName'], $_GET['yourEmail']]);

        $result = true;
    }
}
catch(PDOException $e){
    echo "$e";
    print('Error : ' . $e->getMessage());
    exit();
}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    exit();
}
?>