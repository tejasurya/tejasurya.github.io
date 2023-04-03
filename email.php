<?php
use PHPMailer\PHPMailer\PHPMailer;
$msg = '';
if (array_key_exists('email', $_POST)) {
    require 'vendor/autoload.php';
    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->Port = 587;
    $mail->SMTPDebug = 0;
    $mail->SMTPAuth = true;
    $mail->Username = 'mymail@myawesomedomain.tld';
    $mail->Password = 'My$tr0ngPa55w0rd!';
    $mail->setFrom('mymail@myawesomedomain.tld', 'Mr. Snuffles');
    $mail->addAddress('recipient@domain.tld', 'Receiver Name');
    if ($mail->addReplyTo($_POST['email'], $_POST['name'])) {
        $mail->Subject = 'PHPMailer contact form';
        $mail->isHTML(false);
        $mail->Body = <<<EOT
            Email: {$_POST['email']}
            Name: {$_POST['name']}
            Message: {$_POST['message']}
EOT;
        if (!$mail->send()) {
            $msg = 'Sorry, something went wrong. Please try again later.';
        } else {
            $msg = 'Message sent! Thanks for contacting us.';
        }
    } else {
        $msg = 'Share it with us!';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Contact form</title>
</head>
<body>
<h1>Contact us</h1>
<?php if (!empty($msg)) {
    echo "<h2>$msg</h2>";
} ?>
<form method="POST">
    <label for="name">Name: <input type="text" name="name" id="name"></label><br>
    <label for="email">Email address: <input type="email" name="email" id="email"></label><br>
    <label for="message">Message: <textarea name="message" id="message" rows="8" cols="20"></textarea></label><br>
    <input type="submit" value="Send">
</form>
</body>
</html>