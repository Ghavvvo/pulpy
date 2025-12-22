import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import QRCode from "react-qr-code";


interface QrCardProps {
    profileUrl: string;
}

const QrCard = ({ profileUrl }: QrCardProps) => {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg">Escanea tu qr</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-xl">
                    <div
                        className="w-48 h-48 bg-card rounded-xl shadow-inner flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                            <QRCode
                                value={profileUrl}
                                size={96}
                                className="text-primary mx-auto"
                            />
                            <p className="text-xs text-muted-foreground mt-2">QR Code</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        Escanea para ver el perfil
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default QrCard;
