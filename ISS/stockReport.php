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
      $showProvide = true;
      $showPurchase = true;
      $from = date('Y-m-d',strtotime('-1 month'));
      $to = date('Y-m-d');
      if($_SERVER['REQUEST_METHOD'] === 'POST'){
        if(isset($_POST["searchType"]) && $_POST["searchType"] == "purchase"){
          $showProvide = false;
          $showPurchase = true;
        }elseif(isset($_POST["searchType"]) && $_POST["searchType"] == "provide"){
          $showProvide = true;
          $showPurchase = false;
        }
        if(isset($_POST["fromDate"])){
          $from = htmlspecialchars($_POST['fromDate'], ENT_QUOTES);
          $to = htmlspecialchars($_POST['toDate'], ENT_QUOTES);
        }
      }
      ?>
      <script>
        function formDivTrigger(){
          if(document.getElementById("formDiv").style.display == "none"){
            document.getElementById("formDiv").style.display = "block";
          }else{
            document.getElementById("formDiv").style.display = "none";
          }
        }
        function changeRadio(selectedRadio){
          document.getElementById('allPurchaseRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('allPurchaseRadio').classList.remove("w3-sand");
          document.getElementById('itemsPurchaseRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('itemsPurchaseRadio').classList.remove("w3-sand");
          document.getElementById('servicePurchaseRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('servicePurchaseRadio').classList.remove("w3-sand");
          document.getElementById(selectedRadio+"Radio").style.border = "1px solid #ccc";
          document.getElementById(selectedRadio+"Radio").classList.add("w3-sand");
          if (selectedRadio == "allPurchase") {
            document.getElementsByClassName("radioPurchase")[0].checked = true;
          }else if(selectedRadio == "itemsPurchase"){
            document.getElementsByClassName("radioPurchase")[1].checked = true;
          }else if(selectedRadio == "servicePurchase"){
            document.getElementsByClassName("radioPurchase")[2].checked = true;
          }
        }
        function changeRadio2(selectedRadio){
          document.getElementById('allTypeRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('allTypeRadio').classList.remove("w3-sand");
          document.getElementById('purchaseTypeRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('purchaseTypeRadio').classList.remove("w3-sand");
          document.getElementById('provideTypeRadio').style.border = "1px solid #F6FDFD";
          document.getElementById('provideTypeRadio').classList.remove("w3-sand");
          document.getElementById(selectedRadio+"Radio").style.border = "1px solid #ccc";
          document.getElementById(selectedRadio+"Radio").classList.add("w3-sand");
          if(document.getElementById("purchaseOptionsDiv")){
            document.getElementById("purchaseOptionsDiv").style.display = "none";
          }
          if (selectedRadio == "allType") {
            document.getElementsByClassName("radioType")[0].checked = true;
          }else if(selectedRadio == "purchaseType"){
            document.getElementsByClassName("radioType")[1].checked = true;
            if(document.getElementById("purchaseOptionsDiv")){
              document.getElementById("purchaseOptionsDiv").style.display = "block";
            }
          }else if(selectedRadio == "provideType"){
            document.getElementsByClassName("radioType")[2].checked = true;
          }
        }
      </script>
      <div class="w3-container" style="padding-bottom:40px;">
        <a class="w3-right w3-text-grey" style="cursor:pointer;margin-top: 20px;margin-right: 10px;" onclick="formDivTrigger()">show/hide</a>
        <div id="formDiv" class="w3-margin-top w3-card-2 w3-padding">
          <form action="stockReport.php" method="post">
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
            <p class="w3-text-grey">Type Filter</p>
            <input onclick="changeRadio2('allType')" class="w3-radio radioType" type="radio" name="searchType" value="all" checked>
            <span onclick="changeRadio2('allType')" id='allTypeRadio' class="w3-padding-small w3-sand" style="border:1px solid #ccc;cursor:pointer;">All</span>
            <input onclick="changeRadio2('purchaseType')" class="w3-radio radioType" type="radio" name="searchType" value="purchase">
            <span onclick="changeRadio2('purchaseType')" id='purchaseTypeRadio' class="w3-padding-small" style="border:1px solid #fff;cursor:pointer;">Purchase</span>
            <input onclick="changeRadio2('provideType')" class="w3-radio radioType" type="radio" name="searchType" value="provide">
            <span onclick="changeRadio2('provideType')" id='provideTypeRadio' class="w3-padding-small" style="border:1px solid #fff;cursor:pointer;">Provide</span>
            <?php
              if((!$showProvide || !$showPurchase) && isset($_POST["searchType"])){
                echo "<script>changeRadio2('".$_POST["searchType"]."Type');</script>";
              }
            ?>
            <br>
            <div id="purchaseOptionsDiv" style="display:none;" class="w3-margin-top">
              <p class="w3-text-grey">Purchase Filter</p>
              <input onclick="changeRadio('allPurchase')" class="w3-radio radioPurchase" type="radio" name="purchaseType" value="all" checked>
              <span onclick="changeRadio('allPurchase')" id='allPurchaseRadio' class="w3-padding-small w3-sand" style="border:1px solid #ccc;cursor:pointer;">All</span>
              <input onclick="changeRadio('itemsPurchase')" class="w3-radio radioPurchase" type="radio" name="purchaseType" value="items">
              <span onclick="changeRadio('itemsPurchase')" id='itemsPurchaseRadio' class="w3-padding-small" style="border:1px solid #fff;cursor:pointer;">Items</span>
              <input onclick="changeRadio('servicePurchase')" class="w3-radio radioPurchase" type="radio" name="purchaseType" value="service">
              <span onclick="changeRadio('servicePurchase')" id='servicePurchaseRadio' class="w3-padding-small" style="border:1px solid #fff;cursor:pointer;">Services</span>
            </div>
            <?php
              if(!$showProvide && $showPurchase && isset($_POST["purchaseType"])){
                echo "<script>document.getElementById('purchaseOptionsDiv').style.display = 'block';
                changeRadio('".$_POST["purchaseType"]."Purchase');</script>";
              }
            ?>
            <input class="w3-btn w3-margin-top w3-small w3-border" type="submit" value="Search">
          </form>
        </div>
        <?php
          if($showPurchase){
            echo "<h4>Purchase</h4>";
            $input3 = mysqli_real_escape_string($mysqli, $from);
            $input4 = mysqli_real_escape_string($mysqli, $to);
            if(!isset($_POST["purchaseType"])){
              $sql2 = " SELECT purchase.ServiceType,vendors.name as vendorName,purchase.id,purchase.currency,purchase.poNumber,purchase.forWho,purchase.date,purchase.grandTotal,
                        purchase.paidDate
                        FROM purchase
                        INNER JOIN vendors
                        ON vendors.id = purchase.vendorID
                        WHERE purchase.date >= '".$input3." 00:00:00' AND purchase.date <= '".$input4." 23:59:59'
                        ORDER BY purchase.date DESC";
            }else{
              $allOptions = "";
              if($_POST["purchaseType"] == "service"){
                $purchaseType = "1";
              }elseif($_POST["purchaseType"] == "items"){
                $purchaseType = "0";
              }elseif($_POST["purchaseType"] == "all"){
                $purchaseType = "0";
                $allOptions = "OR purchase.ServiceType = 1";
              }
              $sql2 = " SELECT purchase.ServiceType, vendors.name as vendorName,purchase.id,purchase.currency,purchase.poNumber,purchase.forWho,purchase.date,purchase.grandTotal,
                        purchase.paidDate
                        FROM purchase
                        INNER JOIN vendors
                        ON vendors.id = purchase.vendorID
                        WHERE purchase.date >= '".$input3." 00:00:00' AND purchase.date <= '".$input4." 23:59:59'
                        AND (purchase.ServiceType = ".$purchaseType." ".$allOptions.")
                        ORDER BY purchase.date DESC";
            }
            if(!$result2 = $mysqli->query($sql2)){
              $mysqli->close();
              die("queryFailed");
            }
            if ($result2->num_rows > 0){
              $totalQty = 0;
              $totalPrc = 0;
              echo "<table class='w3-table w3-table-all w3-small'>";
              echo "<tr style='background:#128cae;color:#fff;'><td>PO Type</td><td>PO Number</td><td>Date</td><td>Vendor</td><td>Items/Services</td>
              <td>Quantity</td><td>Price</td><td>Grand Total</td><td>Currency</td><td>Paid</td><td>For</td><td></td></tr>";
              while($row2 = $result2->fetch_assoc()){
                $poType = "Purchase";
                if($row2["ServiceType"] == 1){
                  $poType = "Service";
                }
                echo "<tr><td>".$poType."</td><td>".$row2["poNumber"]."</td><td>".$row2["date"]."</td><td>".$row2["vendorName"]."</td>";
                $convertedGrandTotal = $row2["grandTotal"];
                if($row2["currency"] == "USD"){
                  $totalPrc = $totalPrc + round(($row2["grandTotal"]/2.659002), 3);
                  $convertedGrandTotal = round(($row2["grandTotal"]/2.659002), 3)." (".$row2["grandTotal"].")";
                }elseif ($row2["currency"] == "EUR"){
                  $totalPrc = $totalPrc + round(($row2["grandTotal"]/2.504119), 3);
                  $convertedGrandTotal = round(($row2["grandTotal"]/2.504119), 3)." (".$row2["grandTotal"].")";
                }else{
                  $totalPrc = $totalPrc + $row2["grandTotal"];
                }
                if($row2["ServiceType"] == 0){
                  $sql3 = "SELECT purchaseItems.quantity,purchaseItems.price,items.name,items.brand FROM purchaseItems
                           INNER JOIN items
                           ON purchaseItems.itemID = items.id
                           WHERE purchaseItems.purchaseID=".$row2["id"];
                  if(!$result3 = $mysqli->query($sql3)){
                    $mysqli->close();
                    die("queryFailed");
                  }
                  $purchasedItems = "";
                  $purchasedItemsQty = "";
                  $purchasedItemsPrice = "";
                  while($row3 = $result3->fetch_assoc()){
                    $purchasedItems = $purchasedItems.$row3["name"]." (".$row3['brand'].")<br>";
                    $purchasedItemsQty = $purchasedItemsQty.$row3["quantity"]."<br>";
                    $purchasedItemsPrice = $purchasedItemsPrice.$row3["price"]."<br>";
                    $totalQty = $totalQty + $row3["quantity"];
                  }
                  echo "<td>".$purchasedItems."</td><td>".$purchasedItemsQty."</td><td>".$purchasedItemsPrice."</td>";
                }else{
                  $sql3 = "SELECT `serviceName`, `servicePrice` FROM `purchaseServices` WHERE `purchaseID` = ".$row2["id"];
                  if(!$result3 = $mysqli->query($sql3)){
                    $mysqli->close();
                    die("queryFailed");
                  }
                  $purchasedServices = "";
                  $purchasedServciesPrice = "";
                  $purchasedServicesQty = "";
                  while($row3 = $result3->fetch_assoc()){
                    $purchasedServices = $purchasedServices.$row3["serviceName"]."<br>";
                    $purchasedServciesPrice = $purchasedServciesPrice.$row3["servicePrice"]."<br>";
                    $purchasedServicesQty = $purchasedServicesQty."1<br>";
                    $totalQty = $totalQty + 1;
                  }
                  echo "<td>".$purchasedServices."</td><td>".$purchasedServicesQty."</td><td>".$purchasedServciesPrice."</td>";
                }
                echo "<td>".$convertedGrandTotal."</td>";
                $purchasePaid = "<span class='w3-tag w3-green'>Yes</span>";
                if($row2["paidDate"] == "0000-00-00"){
                  $purchasePaid = "<span class='w3-tag w3-red'>No</span>";
                }
                echo "<td>".$row2["currency"]."</td><td>".$purchasePaid."</td><td>".$row2["forWho"]."</td><td>
                <a class='w3-btn w3-border w3-small' href='purchaseDetails.php?id=".$row2["id"]."&i=report'>Details<a/></td></tr>";
              }
              echo "<tr class='w3-pale-yellow'><td colspan='2'><h6 style='margin:0'>Total Quantity <b>".$totalQty."</b></h6></td>
              <td colspan='2'><h6 style='margin:0'>Total Amount <b>".round($totalPrc, 3)." (BHD)</b></h6></td><td colspan='8'></td></tr>";
              echo "</table>";
            }
          }
          if($showProvide){
            echo "<h4>Provide</h4>";
            $input3 = mysqli_real_escape_string($mysqli, $from);
            $input4 = mysqli_real_escape_string($mysqli, $to);
            $sql5 = "SELECT provide.id,provide.date,provide.notes,provide.provideBy,e1.name as empName, e2.name as reqName, e3.name as recName FROM provide
                     INNER JOIN employees as e1
                     ON e1.empID = provide.empID
                     INNER JOIN employees as e2
                     ON e2.empID = provide.requestBy
                     INNER JOIN employees as e3
                     ON e3.empID = provide.recievedBy
                     WHERE provide.date >= '".$input3." 00:00:00' AND provide.date <= '".$input4." 23:59:59'
                     ORDER BY provide.date DESC";
            if(!$result5 = $mysqli->query($sql5)){
              $mysqli->close();
              die("queryFailed");
            }
            if ($result5->num_rows > 0){
              $totalQtyP = 0;
              echo "<table class='w3-table w3-table-all w3-small'>";
              echo "<tr style='background:#128cae;color:#fff;''><td>Date</td><td>Employee</td><td>Requested By</td><td>Items</td><td>Quantity</td><td>Recieved By</td><td>Provided By</td><td>Notes</td><td></td></tr>";
              while($row5 = $result5->fetch_assoc()){
                echo "<tr><td>".$row5["date"]."</td><td>".$row5["empName"]."</td><td>".$row5["reqName"]."</td>";
                $sql4 = "SELECT items.name,items.brand,provideItems.quantity FROM provideItems
                         INNER JOIN items
                         ON provideItems.itemID = items.id
                         WHERE provideItems.provideID =".$row5["id"];
                if(!$result4 = $mysqli->query($sql4)){
                  $mysqli->close();
                  die("queryFailed");
                }
                $providedItems = "";
                $providedItemsQty = "";
                while($row4 = $result4->fetch_assoc()){
                  $providedItems = $providedItems.$row4["name"]." (".$row4['brand'].")<br>";
                  $providedItemsQty = $providedItemsQty.$row4["quantity"]."<br>";
                  $totalQtyP = $totalQtyP + $row4["quantity"];
                }
                echo "<td>".$providedItems."</td><td>".$providedItemsQty."</td><td>".$row5["recName"]."</td><td>".$row5["provideBy"]."</td><td>".$row5["notes"]."</td><td><a class='w3-btn w3-border w3-small' href='provideDetails.php?id=".$row5["id"]."&i=report'>Details<a/></td></tr>";
              }
              echo "<tr class='w3-pale-yellow'><td colspan='2'><h6 style='margin:0'>Total Quantity <b>".$totalQtyP."</b></h6></td><td colspan='9'></td></tr>";
              echo "</table>";
            }
          }
        ?>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
