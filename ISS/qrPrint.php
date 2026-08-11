<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      if(isset($_GET["code"]) && !empty($_GET["code"])){
        $row = $result->fetch_array(MYSQLI_ASSOC);
        $code = htmlspecialchars($_GET['code'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $code);
        $sql2 = "SELECT * FROM `assets` WHERE `code`='".$input2."'";
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        }
        ?>

        <script src="qrcode.js"></script>
        <script src="imageMerge.js"></script>
        <script>
          window.onload = function (){
            new QRCode(document.getElementById("qrcode"), {
              text:"http://iss.bfginternational.com/ISS/assetDetails.php?code=<?php echo $row2['code']; ?>",
              width:826,
              height:826
            });
            mergeImages(
              [{src:'/qrSticker.jpg',x:0,y:0},
              {src:document.querySelector('canvas').toDataURL(),x:37,y:928}
            ]).then(b64 => document.querySelector('img').src = b64);
            //window.print();
          }
        </script>

        <div>
          <img src="">
          <div style="display:none;" id="qrcode"></div>
        </div>
        <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
