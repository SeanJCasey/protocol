pragma solidity ^0.4.25;

import "Engine.sol";
import "Hub.sol";
import "Trading.sol";
import "Vault.sol";
import "math.sol";
import "Weth.sol";
import "ERC20.i.sol";
import "ExchangeAdapter.sol";
import "TokenUser.sol";

/// @notice Trading adapter to Melon Engine
contract EngineAdapter is DSMath, TokenUser, ExchangeAdapter {

    /// @notice Buys Ether from the engine, selling MLN
    /// @param targetExchange Address of the engine
    /// @param orderValues [0] Min Eth to receive from the engine
    /// @param orderValues [1] MLN quantity
    /// @param orderValues [6] Same as orderValues[1]
    /// @param orderAddresses [2] WETH token
    /// @param orderAddresses [3] MLN token
    function takeOrder (
        address targetExchange,
        address[6] orderAddresses,
        uint[8] orderValues,
        bytes32 identifier,
        bytes makerAssetData,
        bytes takerAssetData,
        bytes signature
    ) public onlyManager notShutDown {
        Hub hub = getHub();

        address wethAddress = orderAddresses[2];
        address mlnAddress = orderAddresses[3];
        uint minEthToReceive = orderValues[0];
        uint mlnQuantity = orderValues[1];

        require(	
            wethAddress == Registry(hub.registry()).nativeAsset(),	
            "maker asset doesnt match nativeAsset on registry"	
        );
        require(	
            orderValues[1] == orderValues[6],	
            "fillTakerQuantity must equal takerAssetQuantity"	
        );

        Vault vault = Vault(hub.vault());
        vault.withdraw(mlnAddress, mlnQuantity);
        require(
            ERC20(mlnAddress).approve(targetExchange, mlnQuantity),
            "MLN could not be approved"
        );

        uint ethToReceive = Engine(targetExchange).ethPayoutForMlnAmount(mlnQuantity);
    
        require(
            ethToReceive >= minEthToReceive,
            "Expected ETH to receive is less than takerQuantity (minEthToReceive)"
        );
        
        Engine(targetExchange).sellAndBurnMln(mlnQuantity);
        WETH(wethAddress).deposit.value(ethToReceive)();
        safeTransfer(wethAddress, address(vault), ethToReceive);
  
        getAccounting().addAssetToOwnedAssets(wethAddress);
        getAccounting().updateOwnedAssets();
        getTrading().orderUpdateHook(
            targetExchange,
            bytes32(0),
            Trading.UpdateType.take,
            [wethAddress, mlnAddress],
            [ethToReceive, mlnQuantity, mlnQuantity]
        );
    }
}
