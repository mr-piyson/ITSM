<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["printerName"]) && !empty($_POST["printerName"]) && isset($_POST["printerLocation"]) && !empty($_POST["printerLocation"]) && isset($_POST["printerUsedBy"]) && !empty($_POST["printerUsedBy"])){
      date_default_timezone_set('Asia/Bahrain');
      $printerName = htmlspecialchars($_POST['printerName'], ENT_QUOTES);
      $printerLocation = htmlspecialchars($_POST['printerLocation'], ENT_QUOTES);
      $printerUsedBy = htmlspecialchars($_POST['printerUsedBy'], ENT_QUOTES);
      $printerDepartment = htmlspecialchars($_POST['printerDepartment'], ENT_QUOTES);
      $printerLink = htmlspecialchars($_POST['printerLink'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $printerName);
      $input2 = mysqli_real_escape_string($mysqli, $printerLocation);
      $input3 = mysqli_real_escape_string($mysqli, $printerUsedBy);
      $input4 = mysqli_real_escape_string($mysqli, $user);
      $input5 = mysqli_real_escape_string($mysqli, $printerDepartment);
      $input6 = mysqli_real_escape_string($mysqli, $printerLink);
      $sql = "INSERT INTO `printers`(`name`, `location`, `usedBy`, `img`, `inActive`, `department`, `printerLink`) VALUES ('".$input1."','".$input2."','".$input3."','',0,'".$input5."','".$input6."')";
      if($mysqli->query($sql) === TRUE){
        $pID = $mysqli->insert_id;
        if(count($_FILES) > 0 && $_FILES['file']['error'] === 0){
          if ($_FILES['file']['error'] !== 0){
            die("failedUpload1");
          }
          $info = getimagesize($_FILES['file']['tmp_name']);
          if ($info === FALSE){
            die("failedUpload2");
          }
          if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
            die("failedUpload3");
          }

          if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/printersImages/printer".$pID."_".$_FILES["file"]["name"])){
            die("failedUpload4");
          }else{
            $imagePath = "/var/www/html/ISS/printersImages/printer".$pID."_".$_FILES["file"]["name"];
            if($info[0] > 1000){
              $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }elseif($info[1] > 1000){
              $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }
            $sql3 = "UPDATE `printers` SET `img`='printer".$pID."_".$_FILES["file"]["name"]."' WHERE `id`=".$pID;
            if($mysqli->query($sql3) === FALSE){
              include "header.php";
              echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
              echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
              die('<meta http-equiv="refresh" content="2;url=home.php" />');
            }
          }
        }
        if(isset($_POST["rollPrinter"])){
          $sqlP = "INSERT INTO `printerInfo`(`printerID`) VALUES (".$pID.")";
          $mysqli->query($sqlP);
        }
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input4.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','printer',".$pID.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=home.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=home.php" />');
      }
      $mysqli->close();
    }
  }
?>
