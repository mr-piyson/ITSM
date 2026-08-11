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
      date_default_timezone_set('Asia/Bahrain');
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <script>
        function formDivTrigger(){
          if(document.getElementById("formDiv").style.display == "none"){
            document.getElementById("formDiv").style.display = "block";
          }else{
            document.getElementById("formDiv").style.display = "none";
          }
        }
      </script>
      <div class="w3-container">
        <h1 class="w3-padding title">Printers Actions Report</h1>
        <a class="w3-right w3-text-grey" style="cursor:pointer;margin-top: 10px;margin-right: 10px;" onclick="formDivTrigger()">show/hide</a>
        <div id="formDiv" class="w3-margin-top w3-card-2 w3-padding">
          <form action="printersReport.php" method="post">
            <div class="w3-row">
              <div class="w3-col m2">
                <label>From</label>
                <input class="w3-input w3-border" type="date" name="fromDate" style="max-width:200px;"
                value="<?php echo (isset($_POST['fromDate'])) ? $_POST['fromDate'] : date('Y-m-d',strtotime('-1 month')); ?>">
              </div>
              <div class="w3-col m2">
                <label>To</label>
                <input class="w3-input w3-border" type="date" name="toDate" style="max-width:200px;"
                value="<?php echo (isset($_POST['toDate'])) ? $_POST['toDate'] : date('Y-m-d'); ?>">
              </div>
            </div>
            <input class="w3-btn w3-margin-top w3-small w3-border" type="submit" value="Search">
          </form>
        </div>
      </div>
      <?php
      if($_SERVER['REQUEST_METHOD'] === 'POST'){
        $from = htmlspecialchars($_POST['fromDate'], ENT_QUOTES);
        $to = htmlspecialchars($_POST['toDate'], ENT_QUOTES);
        $input3 = mysqli_real_escape_string($mysqli, $from);
        $input4 = mysqli_real_escape_string($mysqli, $to);
        $sql2 = "SELECT printers.name as printerName,printers.location,printerActions.actionDate,printerActions.actionBy,printerActions.actionType,
                 items.name as itemName, items.stock as itemStock, printers.id as printerID, items.id as itemID FROM printerActions
                 LEFT JOIN printers
                 ON printers.id = printerActions.printerID
                 LEFT JOIN items
                 ON items.id = printerActions.itemID
                 WHERE printerActions.actionDate >= '".$input3."' AND printerActions.actionDate <= '".$input4."' ORDER BY printerActions.actionDate DESC";
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        echo "<div class='w3-container w3-margin-top' style='padding-bottom:40px;'><div class='w3-card-2 w3-padding'>";
        if ($result2->num_rows > 0){
          echo "<table class='w3-table w3-table-all' style='color:#303030;'>";
          echo "<tr style='background:#128cae;color:#fff;'><td><b>Date</b></td><td><b>Printer</b></td><td><b>Action</b></td><td><b>Toner/Roll</b></td>
          <td><b>Current Stock</b></td><td><b>Action By</b></td></tr>";
          while($row2 = $result2->fetch_assoc()){
            $tagColor = "red";
            $tagColor2 = "";
            if($row2['itemStock'] > 0){
              $tagColor = "green";
            }
            if ($row2['actionType'] == "Replaced") {
              $tagColor2 = "w3-blue";
            }elseif($row2['actionType'] == "Provided"){
              $tagColor2 = "w3-indigo";
            }elseif($row2['actionType'] == "Checked"){
              $tagColor2 = "w3-yellow";
            }elseif($row2['actionType'] == "Serviced"){
              $tagColor2 = "w3-green";
            }elseif($row2['actionType'] == "Cleaned"){
              $tagColor2 = "w3-teal";
            }elseif($row2['actionType'] == "Recieved"){
              $tagColor2 = "w3-orange";
            }
            echo "<tr>
            <td>".$row2['actionDate']."</td>
            <td><a target='_blank' href='printerDetails.php?id=".$row2['printerID']."'>".$row2['printerName']." (".$row2['location'].")</a></td>
            <td><span class='w3-tag ".$tagColor2."'>".$row2['actionType']."</span></td>
            <td><a target='_blank' href='itemDetails.php?id=".$row2['itemID']."'>".$row2['itemName']."</a></td>
            <td><span style='width:40px;' class='w3-tag w3-".$tagColor."'>".$row2['itemStock']."</span></td>
            <td>".$row2['actionBy']."</td>
            </tr>";
          }
          echo "</table>";
        }else{
          echo $sql2;
          echo "<h4>No Result</h4>";
        }
        echo "</div></div>";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
