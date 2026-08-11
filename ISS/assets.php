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
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <script>
        var assetNamesForSearch = [];
        var assetManfuctureForSearch = [];
        var assetCodesForSearch = [];
        var assetSerialNumberForSearch = [];
        var assetOwnerForSearch = [];
        var assetModelForSearch = [];
        var locations = [];
        function triggerView(){
          document.getElementById('assetSearchInput').value = "";
          for (let x=0;x<document.getElementsByClassName('assetsBlocks').length;x++){
            document.getElementsByClassName('assetsBlocks')[x].style.display = "block";
          }
          if(document.getElementById("assetsBlocksDiv").style.display != "none"){
            document.getElementById("assetsBlocksDiv").style.display = "none";
            document.getElementById("assetReportDiv").style.display = "block";
          }else{
            document.getElementById("assetsBlocksDiv").style.display = "block";
            document.getElementById("assetReportDiv").style.display = "none";
          }
        }
        function assetSearch(e){
          if ((document.getElementById('assetSearchInput').value.trim().length > 1)){
            clearfilterStyle();
            document.getElementById('AllFilterLink').classList.remove('w3-light-grey');
            document.getElementById('AllFilterLink').classList.add('w3-blue');
            for (let x=0;x<document.getElementsByClassName('assetsBlocks').length;x++){
              document.getElementsByClassName('assetsBlocks')[x].style.display = "none";
            }
            var counter = 0;
            for (var i=0;i<assetNamesForSearch.length;i++){
              if (assetNamesForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  assetManfuctureForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  assetCodesForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  assetSerialNumberForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  assetOwnerForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  assetModelForSearch[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase()) ||
                  locations[i].toUpperCase().includes(document.getElementById("assetSearchInput").value.trim().toUpperCase())
                ){
                for (let n=0;n<document.getElementsByClassName('assetsBlocks').length;n++){
                  if(n == i){
                    document.getElementsByClassName('assetsBlocks')[n].style.display = "block";
                    counter = counter + 1;
                  }
                }
              }
            }
            document.getElementById("resultP").innerHTML = "Assets ("+counter+")";
            document.getElementById("assetsBlocksDiv").style.display = "block";
            document.getElementById("assetReportDiv").style.display = "none";
          }else{
            for (let x=0;x<document.getElementsByClassName('assetsBlocks').length;x++){
              document.getElementsByClassName('assetsBlocks')[x].style.display = "block";
            }
            document.getElementById("resultP").innerHTML = "Assets ("+document.getElementsByClassName('assetsBlocks').length+")";
            document.getElementById("assetsBlocksDiv").style.display = "block";
            document.getElementById("assetReportDiv").style.display = "none";
          }
        }
        function tableViewTrigger(){
          if(document.getElementById("assetReportDiv").style.display == "block"){
            if(document.getElementById("reportTable").style.width == "100%"){
              document.getElementById("reportTable").style.width = "auto";
              document.getElementById("compactImg").src = "compact2.png";
            }else{
              document.getElementById("reportTable").style.width = "100%";
              document.getElementById("compactImg").src = "compact.png";
            }
          }
        }
        function filterAssets(assetType){
          if(assetType == "All"){
            for (let i=0;i<document.getElementsByClassName('assetsBlocks').length;i++){
              document.getElementsByClassName('assetsBlocks')[i].style.display = "block";
            }
            for (let i=0;i<document.getElementsByClassName('assetsTable').length;i++){
              document.getElementsByClassName('assetsTable')[i].style.display = "table-row";
            }
            document.getElementById("resultP").innerHTML = "Assets ("+document.getElementsByClassName('assetsBlocks').length+")";
          }else{
            for (let i=0;i<document.getElementsByClassName('assetsBlocks').length;i++){
              document.getElementsByClassName('assetsBlocks')[i].style.display = "none";
            }
            for (let i=0;i<document.getElementsByClassName(assetType+'Assets').length;i++){
              document.getElementsByClassName(assetType+'Assets')[i].style.display = "block";
            }
            for (let i=0;i<document.getElementsByClassName('assetsTable').length;i++){
              document.getElementsByClassName('assetsTable')[i].style.display = "none";
            }
            for (let i=0;i<document.getElementsByClassName(assetType+'TableAssets').length;i++){
              document.getElementsByClassName(assetType+'TableAssets')[i].style.display = "table-row";
            }
            document.getElementById("resultP").innerHTML = "Assets ("+document.getElementsByClassName(assetType+'Assets').length+")";
          }
          clearfilterStyle();
          document.getElementById(assetType+'FilterLink').classList.remove('w3-light-grey');
          document.getElementById(assetType+'FilterLink').classList.add('w3-blue');
          document.getElementById('assetSearchInput').value = "";
        }
        function clearfilterStyle(){
          document.getElementById('DesktopFilterLink').classList.add('w3-light-grey');
          document.getElementById('LaptopFilterLink').classList.add('w3-light-grey');
          document.getElementById('MonitorFilterLink').classList.add('w3-light-grey');
          document.getElementById('Face_AccessFilterLink').classList.add('w3-light-grey');
          document.getElementById('CCTVFilterLink').classList.add('w3-light-grey');
          document.getElementById('Wifi_Access_PointFilterLink').classList.add('w3-light-grey');
          document.getElementById('SwitchesFilterLink').classList.add('w3-light-grey');
          document.getElementById('Blade_ServerFilterLink').classList.add('w3-light-grey');
          document.getElementById('UPSFilterLink').classList.add('w3-light-grey');
          document.getElementById('Tape_DriveFilterLink').classList.add('w3-light-grey');
          document.getElementById('FirewallFilterLink').classList.add('w3-light-grey');
          document.getElementById('TabletFilterLink').classList.add('w3-light-grey');
          document.getElementById('TVFilterLink').classList.add('w3-light-grey');
          document.getElementById('TelephoneFilterLink').classList.add('w3-light-grey');
          document.getElementById('P2P_NetworkFilterLink').classList.add('w3-light-grey');
          document.getElementById('ACFilterLink').classList.add('w3-light-grey');
          document.getElementById('Display_ProjectorFilterLink').classList.add('w3-light-grey');
          document.getElementById('RouterFilterLink').classList.add('w3-light-grey');
          document.getElementById('AllFilterLink').classList.add('w3-light-grey');
          document.getElementById('DesktopFilterLink').classList.remove('w3-blue');
          document.getElementById('LaptopFilterLink').classList.remove('w3-blue');
          document.getElementById('MonitorFilterLink').classList.remove('w3-blue');
          document.getElementById('Face_AccessFilterLink').classList.remove('w3-blue');
          document.getElementById('CCTVFilterLink').classList.remove('w3-blue');
          document.getElementById('Wifi_Access_PointFilterLink').classList.remove('w3-blue');
          document.getElementById('SwitchesFilterLink').classList.remove('w3-blue');
          document.getElementById('Blade_ServerFilterLink').classList.remove('w3-blue');
          document.getElementById('UPSFilterLink').classList.remove('w3-blue');
          document.getElementById('Tape_DriveFilterLink').classList.remove('w3-blue');
          document.getElementById('FirewallFilterLink').classList.remove('w3-blue');
          document.getElementById('TabletFilterLink').classList.remove('w3-blue');
          document.getElementById('TVFilterLink').classList.remove('w3-blue');
          document.getElementById('TelephoneFilterLink').classList.remove('w3-blue');
          document.getElementById('P2P_NetworkFilterLink').classList.remove('w3-blue');
          document.getElementById('ACFilterLink').classList.remove('w3-blue');
          document.getElementById('Display_ProjectorFilterLink').classList.remove('w3-blue');
          document.getElementById('RouterFilterLink').classList.remove('w3-blue');
          document.getElementById('AllFilterLink').classList.remove('w3-blue');
        }
      </script>
      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <label style="color:#0b5266;">Search</label>
          <input id="assetSearchInput" onkeyup="assetSearch(event)" type="text" class="w3-input w3-border">
          <a onclick="triggerView()" class="w3-right w3-text-grey" style="cursor:pointer;">List/Blocks</a>
          <p id="resultP" class="w3-text-grey" style="margin:0;display:inline-block;">Assets ()</p>
          <div style="display:inline-block;">
            <a id="DesktopFilterLink" onclick="filterAssets('Desktop')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Desktop</a>
            <a id="LaptopFilterLink" onclick="filterAssets('Laptop')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Laptop</a>
            <a id="MonitorFilterLink" onclick="filterAssets('Monitor')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Monitor</a>
            <a id="Face_AccessFilterLink" onclick="filterAssets('Face_Access')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Face Access</a>
            <a id="CCTVFilterLink" onclick="filterAssets('CCTV')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>CCTV</a>
            <a id="Wifi_Access_PointFilterLink" onclick="filterAssets('Wifi_Access_Point')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Wifi Access Point</a>
            <a id="SwitchesFilterLink" onclick="filterAssets('Switches')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Switches</a>
            <a id="Blade_ServerFilterLink" onclick="filterAssets('Blade_Server')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Blade Server</a>
            <a id="UPSFilterLink" onclick="filterAssets('UPS')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>UPS</a>
            <a id="Tape_DriveFilterLink" onclick="filterAssets('Tape_Drive')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Tape Drive</a>
            <a id="FirewallFilterLink" onclick="filterAssets('Firewall')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Firewall</a>
            <a id="TabletFilterLink" onclick="filterAssets('Tablet')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Tablet</a>
            <a id="TVFilterLink" onclick="filterAssets('TV')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>TV</a>
            <a id="TelephoneFilterLink" onclick="filterAssets('Telephone')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Telephone</a>
            <a id="P2P_NetworkFilterLink" onclick="filterAssets('P2P_Network')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>P2P Network</a>
            <a id="ACFilterLink" onclick="filterAssets('AC')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>AC</a>
            <a id="Display_ProjectorFilterLink" onclick="filterAssets('Display_Projector')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Display Projector</a>
            <a id="RouterFilterLink" onclick="filterAssets('Router')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>Router</a>
            <a id="AllFilterLink" onclick="filterAssets('All')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-blue'>All</a>
          </div>
          <div style="background:url('compact2.png')"></div>
        </div>
      </div>
      <?php
      $sql2 = "SELECT assets.id,assets.code,assets.serialNumber,assets.deviceName,assets.type,assets.location,assets.manufacturer,assets.model,assets.department,
                      assets.processor,assets.os,assets.memory,assets.hdd,assets.ip,assets.specification,assets.image,employees.name as owner, assets.verified FROM assets
               LEFT JOIN employees
               ON assets.empID = employees.empID
               WHERE assets.inActive = 0";
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        echo "<div class='w3-container w3-margin'><a href='newAssets.php' class='w3-btn w3-border w3-small'>Add new asset</a></div>";
        $assetTable = "<div id='assetReportDiv' style='display:none;padding-bottom:40px;padding-left:32px;padding-right:32px;' class='w3-container w3-row'><a class='w3-text-grey' style='cursor:pointer;' onclick='tableViewTrigger()'><img style='width:24px;' id='compactImg' src='compact.png' /></a>";
        $assetTable = $assetTable ."<table id='reportTable' style='width:100%;margin:0 auto;' class='w3-table w3-table-all'><tr style='background:#128cae;color:#fff;'><th>Image</th><th>Code</th><th>Serial Number</th><th>Device Name</th><th>Type</th><th>Owner</th><th></th></tr>";
        echo "<div id='assetsBlocksDiv' style='padding-bottom:40px;' class='w3-container w3-row'>";
        $deviceNameJS = "";
        $computerManufacturerJS = "";
        $computerCodeJS = "";
        $computerSerialJS = "";
        $computerOwnerJS = "";
        $computerModelJS = "";
        $locationsJS = "";
        while($row2 = $result2->fetch_assoc()){
          $tagColor = "";
          if($row2["type"] == "Desktop"){
            $tagColor = "teal";
          }elseif ($row2["type"] == "Laptop") {
            $tagColor = "dark-grey";
          }elseif ($row2["type"] == "Monitor") {
            $tagColor = "brown";
          }elseif ($row2["type"] == "Face Access") {
            $tagColor = "blue-grey";
          }elseif ($row2["type"] == "CCTV") {
            $tagColor = "lime";
          }elseif ($row2["type"] == "Wifi Access Point") {
            $tagColor = "khaki";
          }elseif ($row2["type"] == "Switches") {
            $tagColor = "light-blue";
          }elseif ($row2["type"] == "Blade Server") {
            $tagColor = "cyan";
          }elseif ($row2["type"] == "UPS") {
            $tagColor = "light-green";
          }elseif ($row2["type"] == "Tape Drive") {
            $tagColor = "sand";
          }elseif ($row2["type"] == "Firewall") {
            $tagColor = "yellow";
          }elseif ($row2["type"] == "Tablet") {
            $tagColor = "orange";
          }elseif ($row2["type"] == "TV") {
            $tagColor = "indigo";
          }elseif ($row2["type"] == "Telephone") {
            $tagColor = "purple";
          }elseif ($row2["type"] == "P2P Network") {
            $tagColor = "pale-yellow";
          }elseif ($row2["type"] == "AC") {
            $tagColor = "pale-red";
          }elseif ($row2["type"] == "Display Projector") {
            $tagColor = "pale-blue";
          }elseif ($row2["type"] == "Router") {
            $tagColor = "pale-green";
          }
          $typeText = str_replace(' ', '_', $row2["type"]);
          echo "<div class='w3-quarter w3-padding assetsBlocks ".$typeText."Assets'><div class='w3-light-grey w3-padding'>";
          if(!empty($row2["image"])){
            echo "<img class='w3-right blockImages' style='width:30%;max-height:110px;' data-src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['image']."' />";
          }
          echo "<h4 style='text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["code"]."</h4>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["deviceName"]) ? "-" : $row2["deviceName"])."</p>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["serialNumber"]) ? "-" : $row2["serialNumber"])."</p>";
          echo "<p class='w3-text-grey' style='margin:0;'>".(empty($row2["owner"]) ? "-" : $row2["owner"])."</p>";
          echo "<p style='margin:0;'><span class='w3-small w3-tag w3-".$tagColor."'>".$row2["type"]."</span><span class='w3-small w3-tag w3-pale-green'>".$row2["location"]."</span><span class='w3-small w3-tag w3-pale-red'>".$row2["department"]."</span>";
          if($row2["verified"] != "0000-00-00 00:00:00"){
            echo "<img style='width:18px;' src='check.png' />";
          }
          echo "</p>";
          echo "<div style='text-align:right;'><a href='assetDetails.php?code=".$row2["code"]."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></div>";
          echo "</div></div>";
          $imageTable = "";
          if(!empty($row2["image"])){
            $imageTable = "<img class='w3-right tableImages' style='height:50px;' data-src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['image']."' />";
          }
          $assetTable = $assetTable."<tr class='".$typeText."TableAssets assetsTable'><td>".$imageTable."</td><td>".$row2["code"]."</td>";
          $assetTable = $assetTable."<td>".$row2["serialNumber"]."</td><td>".$row2["deviceName"]."</td><td>".$row2["type"]."</td><td>".$row2["owner"]."</td>";
          $assetTable = $assetTable."<td><a href='assetDetails.php?code=".$row2["code"]."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></td></tr>";
          $deviceNameJS = $deviceNameJS . "'".$row2["deviceName"]."',";
          $computerManufacturerJS = $computerManufacturerJS . "'".$row2["manufacturer"]."',";
          $computerCodeJS = $computerCodeJS . "'".$row2["code"]."',";
          $computerSerialJS = $computerSerialJS . "'".$row2["serialNumber"]."',";
          $computerOwnerJS = $computerOwnerJS . "'".$row2["owner"]."',";
          $computerModelJS = $computerModelJS . "'".$row2["model"]."',";
          $locationsJS = $locationsJS . "'".$row2["location"]." ".$row2["department"]."',";
        }
        echo "</div>";
        $assetTable = $assetTable . "</table></div>";
        echo $assetTable;
        ?>
        <script>
          window.onload = function(){
            document.getElementById("resultP").innerHTML = "Assets ("+document.getElementsByClassName('assetsBlocks').length+")";
            assetNamesForSearch = [<?php echo $deviceNameJS; ?>];
            assetManfuctureForSearch = [<?php echo $computerManufacturerJS; ?>];
            assetCodesForSearch = [<?php echo $computerCodeJS; ?>];
            assetSerialNumberForSearch = [<?php echo $computerSerialJS; ?>];
            assetOwnerForSearch = [<?php echo $computerOwnerJS; ?>];
            assetModelForSearch = [<?php echo $computerModelJS; ?>];
            locations = [<?php echo $locationsJS; ?>];
            for (let i=0;i<document.getElementsByClassName("blockImages").length;i++){
              document.getElementsByClassName("blockImages")[i].src = document.getElementsByClassName("blockImages")[i].getAttribute("data-src");
            }
            for (let i=0;i<document.getElementsByClassName("tableImages").length;i++){
              document.getElementsByClassName("tableImages")[i].src = document.getElementsByClassName("tableImages")[i].getAttribute("data-src");
            }
          }
        </script>
        <?php
      }else{
        echo "no Assets";
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
