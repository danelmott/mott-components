'use client'
import CustomModal from '../customModal/customModal'
import Input from '../input/input'
import ButtonGroup from '../buttons/buttonGroup'
import Button from '../buttons/button'
import { Avatar } from '@dicebear/core'
import Icon from '../icon/icon'
import { useTheme } from '../theme/themeContext'
import SwatchButton from '../themeModal/swatchButton'



//modal for onboarding user
export default function OnboardingModal(open, onClose, triggerRef, section) {
    const {THEMES_AVAILABLE, variant, setColorSeedHex, colorSeedHex} = useTheme();
    
    const isActive = (theme) =>
        theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;
    

    return (
        <CustomModal>
            <div className='w-[400px] px-[var(--pad-card)] py-[var(--gap-page)]'>
                <Button
                   variant='gost'
                   iconOnly
                   shape='pill'
                   onClick={onCLose}
                   aria-label="Cerrar"
                   className="absolute top-[12px] rigth-[12px]"
                   style={{color: 'var(--md-sys-color-on-surface-variant)'}}
                >
                    <Icon name='close' size='lg'/>
                </Button>
                {section === 'themeSelect' ? (
                <>
                    <h2 
                       className='mott-headline-large mott-title-emphasis'
                       style={{
                        color: 'var(--md-sys-color-on-surface)',
                        marginTop: 0
                       }}
                    >
                        Personaliza tu experiencia
                    </h2>
                    
                    <div className='flex flex-wrap gap-[var(--gap-group)]'>
                        {THEMES_AVAILABLE.map((theme) => {
                            <SwatchButton
                              key={theme.name}
                              theme={theme}
                              selected={isActive(theme)}
                              onSelect={() => setColorSeedHex(theme.hex, theme.variant)}
                            />
                        })}
                    </div>
                </>
                ): section === 'nameSection' ? (
                    <>
                    <div className='section_user'>

                    </div>
                    
                    </>
                ): (
                    <>
                    <div>
                        onboarding terminado
                    </div>
                    </>
                )} 

   
            </div>
        </CustomModal>
    );
}