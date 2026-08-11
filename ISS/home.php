<?php
  date_default_timezone_set("Asia/Bahrain");
  include "header.php";

  if (isset($_POST['username']) && !empty($_POST['username']) && isset($_POST['password']) && !empty($_POST['password'])){
    $us = trim(htmlspecialchars($_POST['username'], ENT_QUOTES));
    $ps = trim(htmlspecialchars($_POST['password'], ENT_QUOTES));
    checkDB($us,$ps);
  }else{
    if (isset($_SESSION['ISStoken'])){
      checkSessionToken($_SESSION['ISStoken']);
    }else{
      die('<meta http-equiv="refresh" content="0;url=index.php" />');
    }
  }

  function checkDB($user,$pass){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }

    $input1 = mysqli_real_escape_string($mysqli, $user);

    $sql = "SELECT * FROM `users` WHERE `username` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli -> close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      $sql3 = "INSERT INTO `logins_logs`(`ip`, `date`, `userID`, `login_success`) VALUES ('".$_SERVER['REMOTE_ADDR']."', STR_TO_DATE('".date("Y-m-d H:i:s")."', '%Y-%m-%d %H:%i:%S'),0, 0)";
      $mysqli->query($sql3);
      $mysqli -> close();
      die("<meta http-equiv='refresh' content='2;url=index.php' /><center><div class='w3-container w3-red'><h3>Wrong user!</h3></div><h4>Redirecting ... </h4></center>");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      if (!password_verify($pass, $row["password"])) {
        $mysqli -> close();
        die("<meta http-equiv='refresh' content='2;url=index.php' /><center><div class='w3-container w3-red'><h3>Wrong password!</h3></div><h4>Redirecting ... </h4></center>");
      }

      $sql3 = "INSERT INTO `logins_logs`(`ip`, `date`, `userID`, `login_success`) VALUES ('".$_SERVER['REMOTE_ADDR']."', STR_TO_DATE('".date("Y-m-d H:i:s")."', '%Y-%m-%d %H:%i:%S'),".$row["id"].", 1)";
      $mysqli->query($sql3);

      $token = bin2hex(openssl_random_pseudo_bytes(16));

      $sql4 = "UPDATE `users` SET `token`='".$token."' WHERE `id`=".$row["id"];
      $mysqli->query($sql4);
      if ($mysqli->query($sql4) === TRUE){
        $_SESSION['ISStoken'] = $token;
      }
      $mysqli -> close();

      include "functions.php";
      showContents($row);
    }
  }

  function checkSessionToken($token){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli -> close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      $sql3 = "INSERT INTO `logins_logs`(`ip`, `date`, `userID`, `login_success`) VALUES ('".$_SERVER['REMOTE_ADDR']."', STR_TO_DATE('".date("Y-m-d H:i:s")."', '%Y-%m-%d %H:%i:%S'),0, 0)";
      $mysqli->query($sql3);
      $mysqli -> close();
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='2;url=index.php' /><center><div class='w3-container w3-red'><h3>Wrong token!</h3></div><h4>Redirecting ... </h4></center>");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $mysqli -> close();
      include "functions.php";
      showContents($row);
    }
  }

  include "footer.php";
?>
