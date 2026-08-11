<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
  if(isset($_POST["descrip"]) && !empty($_POST["descrip"]) && isset($_POST["user"]) && !empty($_POST["user"])){
    date_default_timezone_set('Asia/Bahrain');
    $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
    $pageType = htmlspecialchars($_POST['pgtype'], ENT_QUOTES);
    $requestPrio = htmlspecialchars($_POST['requestprio'], ENT_QUOTES);
    $newpgName = "";
    if (isset($_POST['newpg'])){
      $newpgName = htmlspecialchars($_POST['newpg'], ENT_QUOTES);
    }
    $pageName = "";
    if (isset($_POST['slctname'])){
      $pageName = htmlspecialchars($_POST['slctname'], ENT_QUOTES);
    }
    $otherpgName = "";
    if (isset($_POST['otherpg'])){
      $otherpgName = htmlspecialchars($_POST['otherpg'], ENT_QUOTES);
    }
    $modifications = "N/A";
    if (isset($_POST['modifi'])){
      $modifications = htmlspecialchars($_POST['modifi'], ENT_QUOTES);
    }
    $description = htmlspecialchars($_POST['descrip'], ENT_QUOTES);
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $input2 = mysqli_real_escape_string($mysqli, $user);
    $input3 = mysqli_real_escape_string($mysqli, $pageType);
    $input4 = mysqli_real_escape_string($mysqli, $newpgName);
    $input5 = mysqli_real_escape_string($mysqli, $pageName);
    $input6 = mysqli_real_escape_string($mysqli, $otherpgName);
    $input7 = mysqli_real_escape_string($mysqli, $modifications);
    $input8 = mysqli_real_escape_string($mysqli, $description);
    $input9 = mysqli_real_escape_string($mysqli, $requestPrio);

    $sql3 = "INSERT INTO `requests`(`user`, `pgtype`, `newpg`, `slctname`, `otherpg`, `modifi`, `descrip`, `status`, `submitDate`, `requestPrio`)
    VALUES ('$input2', '$input3', '$input4', '$input5', '$input6', '$input7', '$input8','pending',STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'".$input9."')";

    if($mysqli->query($sql3) === TRUE){
      $requestID = $mysqli->insert_id;

      $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`)
                 VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'), 'add', 'changerequest', ".$requestID.")";
      $mysqli->query($sqlLog);

      if(!empty($_FILES['imagefile']['name'])){
        if ($_FILES['imagefile']['error'] !== 0){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
          die();
        }
        $info = getimagesize($_FILES['imagefile']['tmp_name']);
        if ($info === FALSE){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
          die();
        }
        if (($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Wrong Image Type</h2><center></center>";
          die();
        }

        if (!move_uploaded_file($_FILES["imagefile"]["tmp_name"], "/var/www/html/ISS/itemsImages/requests".$requestID."_".$_FILES["imagefile"]["name"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
          die();
        }else{
          $imagePath = "/var/www/html/ISS/itemsImages/requests".$requestID."_".$_FILES["imagefile"]["name"];
          if($info[0] > 1000){
            $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }elseif($info[1] > 1000){
            $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }
          $sqlIMG = "UPDATE `requests` SET `imagefilePath`='requests".$requestID."_".$_FILES["imagefile"]["name"]."' WHERE `id`=".$requestID;
          if($mysqli->query($sqlIMG) === FALSE){
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Update Record Fail</h2><center></center>";
            die();
          }
        }
      }

      $sql4 = "SELECT email FROM users WHERE users.id =".$input2;
      if($result4 = $mysqli->query($sql4)){
        $row4 = $result4->fetch_array(MYSQLI_ASSOC);
        require('res/PHPMailer.php');
        require('res/SMTP.php');
        $mail = new PHPMailer(true);
        $imagescontent= file_get_contents('emailFooter.png');
        $mail->CharSet = 'UTF-8';
        $mail->isSMTP();
        $mail->Host       = "smtp.office365.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = "systems@bfginternational.com";
        $mail->Password   = "Mad51922";
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
        $mail->addAddress($row4["email"]);
        $mail->addCC('it@bfginternational.com');
        $mail->isHTML(true);
        $mail->Subject = 'IT Portal Request: '.$requestID.' Recieved - '.date('Y-m-d H:i:s');
        $mail->Body    = 'A new ITSM Change Request was recieved.<br>Status and Replies can be checked <a href ="http://iss.bfginternational.com/ISS/requestReplies.php?request='.$requestID.'">here</a>.<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
        <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
        $mail->send();
      }

      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
      die('<meta http-equiv="refresh" content="2;url=requestsList.php" />');

    }else{
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
      die('<meta http-equiv="refresh" content="2;url=changeRequest.php" />');
    }
  }
}
?>
